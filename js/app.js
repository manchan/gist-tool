/**
 *　Gist
 *
 * @constructor
 */
function Gist() {
    this.q = '';
    this.api_url = 'https://api.github.com/gists/';
    this.cross_domain_url = 'http://github-gist.appspot.com/getdata.php?url=';
    this.response_field = $('#response');
    this.result_txt = $("#result");
    this.owner = $("#owner");
    this.desc = $("#desc");
}

/**
 * SelectText
 * @param element
 */
Gist.prototype.SelectText = function(element) {

    var text = document.getElementById(element);
    var userAgent = window.navigator.userAgent.toLowerCase();
    if (userAgent.indexOf('msie') != -1) {
        var range = document.body.createTextRange();
        range.moveToElementText(text);
        range.select();
    } else if (userAgent.indexOf('firefox') != -1 || userAgent.indexOf('opera') != -1) {
        var selection = window.getSelection();
        var range = document.createRange();
        range.selectNodeContents(text);
        selection.removeAllRanges();
        selection.addRange(range);
    } else if (userAgent.indexOf('safari') != -1) {
        var selection = window.getSelection();
        selection.setBaseAndExtent(text, 0, text, 1);
    }
};

/**
 * GetEmbedSrc
 * @param url
 */
Gist.prototype.GetEmbedSrc = function(url){

    $.ajax({
        type: 'GET',
        url: this.cross_domain_url + url,
        dataType: 'html',
        cache: false,
        crossDomain: 'true',
        success: function(data){
            if(data){
                var rep= data.replace(/document.write\(|'\)|'/g,"").replace(/\\n/g, "\n").replace(/\\/g, "");
                $("#gist_src").text("").append(rep);
            }
        },
        error: function(){
            alert('Network Error. Reload browser please.');
        }
    });
};

/**
 * OneGistGet
 * @param url
 * @param q
 * @returns {*}
 */
Gist.prototype.OneGistGet = function(url, q){

    this.q = q;
    var defer = $.Deferred();

    $.ajax({
        url: url,
        dataType: 'json',
        cache: false,
        success: defer.resolve,
        error: defer.reject
    });

    return defer.promise();
};

/**
 * ResponseFormat
 * @param data
 */
Gist.prototype.ResponseFormat = function(data){

    var obj = this;
    this.response_field.show();
    $('pre[id^="embed"]').hide();
    $('.select_txt').hide();

    if(data){
        var gist_id = data.id;
        var owner_name = data.owner.login;
        var ava_img = "<img src='"+data.owner.avatar_url+"' alt='" + owner_name + "' class='ava_img'/>";
        this.owner.text("Owner: "+ owner_name).append(ava_img);
        this.desc.text("Description: "+data.description);

        var count = 0;
        $.each(data.files, function(k, v) {

            var embed_html = "<script src='https://gist.github.com/"+ gist_id  +".js'></script>\n";
            embed_html +=
                "<noscript><pre><code>"
                + "\n\nFile: " + v.filename
                + "\n-------------------------\n\n "
                + v.content +
                "\n\n</code></pre></noscript>\n"+
				"use with <a href='http://manchan.github.io/gist-tool/'>Gist Search</a>";

            obj.desc.after("<br><a href='javascript:void(0)' class='select_txt' id='select"+count+"'>Select Embed Code</a><br>");
            $('#select'+count).after("<pre id='embed"+count+"'></pre>");
            $('#embed'+count).show().text(embed_html);
            count++;
        });

        obj.GetEmbedSrc('https://gist.github.com/' + owner_name + '/' + gist_id + '.js');
    }
};

$(function(){

    var gist = new Gist();
    gist.response_field.hide();

    $('#submitBt').on('click', function(){
        gist.result_txt.text("");
        var q = $(".tt-query").val();

        gist.OneGistGet(gist.api_url + q, q)
            .done(function(data){
                gist.ResponseFormat(data);
            })
            .fail(function(){
                gist.response_field.hide();
                gist.result_txt.text("Not Found " + gist.q);
            });
    });

    /**
     * Select Embed Code
     */
    $(document).on('click','.select_txt', function(){
        var selected_custom = $('#'+this.id).next("pre").attr("id");
        gist.SelectText(selected_custom);
    });
});