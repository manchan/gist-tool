$.support.cors = true;

function SelectText(element) {
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
}

function getEmbedSrc(url){

    $.ajax({
        type: 'GET',
        url: url,
        dataType: 'html',
        cache: false,
        crossDomain: 'true',
        success: function(data){

            if(data){
                var rep= data.replace(/document.write\(|'\)|'/g,"").replace(/\\n/g, "\n").replace(/\\/g, "");
                $("#gist_src").text("");
                $("#gist_src").append(rep);
            }
        },
        error: function(){

//            setTimeout(function() {
//                $.getScript(url, function(){
//                    alert("Script loaded and executed.");
//                });
//            }, 100)
//            $("#response").hide();
        }
    });
}


function get_api(url, q){

    var gist_id = q;

    $.ajax({
        type: 'GET',
        url: url,
        dataType: 'json',
        cache: false,
        success: function(data){
            $("#response").show();
            if(data){
                gist_id = data.id;
                var owner = data.owner.login;
                $("#owner_txt").text("Owner: "+ owner);
                var ava_img = "<img src='"+data.owner.avatar_url+"' alt='"+owner+"' class='ava_img'/>";
                $("#owner_txt").append(ava_img);
                $("#desc_txt").text("Description: "+data.description);

                jQuery.each(data.files, function(k, val) {

                    var file_name = val.filename;
                    var content = val.content;
                    var lang = val.language;
                    var raw_url = val.raw_url;
                    var embed_html = "<script src='https://gist.github.com/"+ gist_id  +".js'></script>\n";
                    embed_html += "<noscript><pre><code>"
                        +"\n\nFile: "+ file_name
                        +"\n-------------------------\n\n"
                        +content+
                        "\n\n</code></pre></noscript>";
                    $('#embed').show().text(embed_html);
                });

                getEmbedSrc('https://gist.github.com/' + owner + '/' + gist_id + '.js');
            }
        },
        error: function(){
            $("#response").hide();
            $("#result").text("Not Found " + gist_id);
        }
    });
}

$(function(){
    $("#response").hide();
    $('#submitBt').on('click', function(){
        $("#result").text("");
        var q = $(".tt-query").val();
        var api = 'https://api.github.com/gists/' + q;
        get_api(api, q);
    });
    $('#select').on('click', function(e){
        SelectText('embed');
        e.preventDefault();
    });
});