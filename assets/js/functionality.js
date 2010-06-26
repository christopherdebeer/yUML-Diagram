if(window.location.hash) {
        wordtosearch = window.location.hash;
        wordtosearch = wordtosearch.substring(1);
        $("#wordtosearch").val(wordtosearch);
        generateUML(wordtosearch);
    }

    jQuery(function(){
        $.fn.formLabels({labelParent : 'form'});
        $("form").submit(function(){
            wordtosearch = $("#wordtosearch").val();
            window.location.hash = "#" + wordtosearch;
            generateUML(wordtosearch);
            return false;
        })
    });

    function generateUML (wordtosearch) {

        // GET SDWA

        window.urlsdwa = "http://alpha.iliketext.com/word/" + wordtosearch + "/sdwa.jsonp";
        $.getJSON(window.urlsdwa + "&callback=?", function(data){
            if (data.status == "ok") {
                window.sdwa = data.sdwa;
                window.maxsdwa = window.sdwa.length;
                window.count = 0;
                window.yuml = "";
                for (window.countsdwa in window.sdwa) {

                    if (window.countsdwa == 0) {
                        window.yuml = "["+wordtosearch+"]";
                    }
                    else {
                        window.yuml = window.yuml + ", [" + wordtosearch + "]-sdwa^[" + window.sdwa[window.countsdwa] + "]";
                    }

                    // GET CDWA of SDWA

                    window.urlcdwa = "http://alpha.iliketext.com/word/" + window.sdwa[window.countsdwa] + "/cdwa.jsonp";
                    $.getJSON(window.urlcdwa + "&callback=?", function(data2){
                        if (data2.status == "ok") {

                            window.cdwa = data2.cdwa;
                            for (window.countcdwa in window.cdwa) {
                                window.yuml = window.yuml + ", [" + data.sdwa[window.count] + "]-cdwa>[" + window.cdwa[window.countcdwa] + "]";
                            }
                            window.count++
                            if (window.count == window.maxsdwa) {
                                $('#result').html("<h2>Results:</h2><img src='http://yuml.me/diagram/nofunky;dir:LR;scale:60;/class/" + window.yuml +  ".png' alt='yUML Image Loading...' />");
                            }
                        }
                    });
                }

            } else {
                alert("Error " + data.error.code + ": " + data.error.msg);
            }

        });
    }

