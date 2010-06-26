/*
 * @File:        jquery.formLabels1.0.js
 * @Version:     1.0RC3
 * @Author:      Andrei Zharau (www.libertyconcepts.com)
 *
 * @Requires:    jQuery v1.4++ & jQueryUI v1.8++
 * @Usage:       $j.fn.formLabels()
 * @Options:     excludeElts - Excludes certain elements from being 'labelized'. Default: ''. Example:  $.fn.formLabels(excludeElts:'#email, .nolabel')
 *               refreshOnResize - whether or not refresh labels on window resize. Default: true
 *               safemode - if enabled the plugin runs in the safemode without using spans and animation. Default: false
 * @Methods:     $.fn.formLabels.refreshLabels() - refresh labels' position. Useful when input position has been changed due to DOM modifications, elements resizing, etc.
 *               $.fn.formLabels.detachLabels() - removes labels from inputs, but do not destroy them.
 * @Changelog
 *               1.0RC3
 *               + fixed probmlems with input events in IE
 *               + Green Hue Opacity bug in FF (thanks to Ionut Staicu)
 *               1.0RC2
 *               + plugin supports a new refresh method
 *               + new options: safemode and labelParent
 *               + refresh on window resize is now an option
 *               + slightly updated performance
 * Copyright 2010 Liberty Concepts, all rights reserved.
 *
 * This source file is free software, under either the GPL v2 license or a
 * BSD style license, as supplied with this software.
 *
 * This source file is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE. See the license files for details.
 */
;
(function($){
    var formLabels,
    opts,
    elts;

    $.fn.tagName = function() {
        return this.get(0).tagName;
    }
    formLabels = $.fn.formLabels = function(options) {
        opts = $.extend({
            excludeElts: '', //elements to be excluded
            refreshOnResize: false, //whether or not refresh labels on 'resize' event for window
            safemode:false, //enable safe mode without DOM modifications
            labelParent: 'body' //specifies a block that will store the form labels (body or form)
        },options);
        var spanID = 0;
        elts = $("textarea, input[type='email'], input[type='text'], input[type='password']").not(opts.excludeElts).filter(":visible[title]");
        if (elts.length && !opts.safemode) {
            elts.each(function(){
                var $this = $(this);
                var labelParent;
                if (opts.labelParent == 'body') {
                    labelParent = 'body';
                }
                else {
                    labelParent = $this.closest('form');
                    if (labelParent.css('position') != 'absolute')
                        labelParent.css({
                            'position':'relative'
                        })
                }
                if(this.value == '' && this.title != '') {
                    var label = this.title;
                    var parentPosition, offsetValue, myPosition;
                    var paddingValue = {
                        top: parseFloat($this.css("padding-top")) + 1,
                        left: (parseFloat($this.css("padding-left")) < 2) ? 2 : parseFloat($this.css("padding-left")) + 1
                    }
                    if ($this.tagName() == 'TEXTAREA') {
                        parentPosition = 'left top';
                        myPosition = 'left top';
                        offsetValue = paddingValue.left + ' ' + paddingValue.top;
                    }
                    else {
                        parentPosition = 'left center';
                        myPosition = 'left center';
                        offsetValue = paddingValue.left + ' 0'
                    }
                    $("<span/>", {
                        css: {
                            'font-family'       : $this.css("font-family"),
                            'font-size'         : $this.css("font-size"),
                            'font-style'        : $this.css("font-style"),
                            'font-weight'       : $this.css("font-weight"),
                            'text-shadow'       : ($.support.opacity) ? $this.css("text-shadow") : '',
                            'line-height'       : $this.css("line-height"),
			    'background-color'	: ($this.css("background-color") == 'transparent') ? '#fff' : $this.css("background-color"),
                            'position'          : 'absolute',
                            'top'               : 0,
                            'left'              : 0,
                            'color'             : $this.css("color"),
                            '-moz-user-select'  : 'none',
                            '-webkit-user-select'  : 'none',
                            'cursor'            : 'text',
                            'z-index'           : '999'
                        },
                        id: "spanLabel" + spanID,
                        "class" : "fLabel",
                        html : label ,
                        click : function(){
                            $this.trigger('focus');
                            return false;
                        }
                    })
                    .appendTo(labelParent)
                    .position({
                        my: myPosition,
                        at: parentPosition,
                        of: $this,
                        offset: offsetValue,
                        collision: 'none'
                    });
                    $this.data({
                        "spanID"    : "#spanLabel" + spanID,
                        "my"        : myPosition,
                        "at"        : parentPosition,
                        "offset"    : offsetValue
                    })
                }
                spanID++; //Increasing spanID by one
            });

            elts.bind('focus blur change cut paste input keyup', function(e){
                var LabelSpanID = $($(this).data("spanID"));
                if (e.type == 'focus') {
                    if(this.title != '' && this.value == '') {
                        LabelSpanID.stop().fadeTo(300,0.2);
                    }
                }
                if (e.type == 'blur') {
                    if(this.value == '' && this.title != '') {
                        LabelSpanID.stop().fadeTo(300,1, function(){
                            if (!$.support.opacity) this.style.removeAttribute("filter");
                        })
                    }
                }
                if (e.type == 'change' || e.type == 'cut' || e.type == 'paste' || e.type == 'input' || e.type == 'keyup') {
                    if(this.title != '') {
                        LabelSpanID.stop().fadeOut(300)
                    }
                    if(this.value == '') {
                        LabelSpanID.stop().fadeTo(100,0.2)
                    }
                }

            });
            if (opts.refreshOnResize) {
                $(window).bind("resize", function(){
                    formLabels.refreshLabels(elts);
                });
            }
        }
        if (elts.length && opts.safemode) {
            elts.val(function(i,v){
                if(v == '')
                    return this.title;
                else return v
            });
            elts.bind('focus blur', function(e){
                if (e.type == 'focus') {
                    if(this.value == this.title)
                        this.value = '';
                }
                else {
                    if(this.value == '')
                        this.value = this.title;
                }
            })
            $("input:image, button, input:submit").click(function(){
                $(this.form.elements).each(function(){
                    if(this.type =='email' || this.type =='text' || this.type =='textarea' || this.type =='password' ){
                        if(this.value == this.title && this.title != ''){
                            this.value='';
                        }
                    }
                });
            });
        }
    }

    //refresh method
    formLabels.refreshLabels = function() {
        elts.each(function(){
            var $this = $(this);
            var assocSpan = $($this.data("spanID"));
            assocSpan.position({
                my: $this.data("my"),
                at: $this.data("at"),
                of: $this,
                offset: $this.data("offset"),
                collision: 'none'
            });
        })
    }
    

})(jQuery);