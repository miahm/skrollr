/**
 * jQuery Miso Animator - v1.0.0
 * Copyright (c) 2014 ProjectMiso, LLC
 * License: Restricted to approved license holders only. 
 *
 * @Description: This module will handle various page level animation and parallax style animation.
 * The module can detect HTML5 data-transition properties and passed in JSON string to configure
 *
 * Also the module can track sections of the page and broadcast which section is closest to the top and 
 * in better view so navigation can be worked out using the data. An event will be fired with the closest
 * section. The event is attached to the context element - default is the 'window'.
 *
 */

var misoAnimator;

(function($){
    /*
     * Options may include - 
     *      options.context         Optional    CSS selector for the container (with scroll bars) context - default is the window
     *      options.boundTo         Optional    CSS Context for an element to broadcast relative positions
     */
    misoAnimator = new Class({
        initialize: function(elements, options){
            var $this = this;
            if (typeof elements == 'undefined' || !elements.length) return;
		
            if (typeof options == 'object' || typeof options == 'undefined' ) {
                
                //Default options
                this.config = {
                    'initiated': 1,
                    'context': window,
                    'sectionScrollDirection': 'vertical'
                }
                //Add the custom options
                $.extend(this.config, options);
            
                //Store the element in question
                this.$els = $(elements);
                //log(this.$els)
            
                //Stop this if elements are not present
                if (!this.$els.length) return;
        
                //Create a storage for global values not part of the config
                this.globals = {};
                
            
                //Loop through each element to add to the tracker
                //var addToTracker = [];
                //this.$els.each(function(i, el){
                //    $el = $(el);
                    //Collect the items that are not part of miso tracker
                //    if (!$el.data('misoTracker')) addToTracker[addToTracker.length] = $el;
                //});
                //Add the new elements to miso tracker
                //var $temp = $($.map(addToTracker, function(el){return $.makeArray(el)}));
                //if ($temp.length) new misoTracker($temp);
                //$temp = null;
                
                //Loop through elements to process them for the animator
                this.$els.each(function(i, el){
                    $el = $(el);
                    $el.data('misoAnimator', {});
                
                    var json = $el.getJSON('data-transition');
                    $el.data('misoAnimator').JSON = json;
                    
                    /* Possible properties of data('misoAnimator').JSON
                     * json.start       Object
                     * json.end         Object
                     * json.repeat      Boolean
                     * json.delay       mil. seconds
                     * json.duration    mil. seconds
                     * json.easing      String
                     * json.stop        Boolean
                     * json.queue       Boolean
                     * json.complete    Function
                     * json.start       Function
                     * json.onView      Boolean     To trigger animation on view
                     * json.Error
                     */
                    
                    if (json.Error){
                        log($el)
                        log(json)
                    }
                    //log($el.data('misoAnimator'))
                
                    //For the animation objects
                    if (json.start) {
                        //log(json.start);
                        $el.css(json.start);                    //Reset style to 'start'
                        $el.data('misoAnimator').reset = 1;     //Mark that items is in reset state
                        $el.data('misoAnimator').done = 0; //for marking one time animation completion state
                        
                        //log('Position ' + $el.css('position'));
                        if ($el.css('position') != 'absolute' && $el.css('position') != 'relative' && $el.css('position') != 'fixed') $el.css('position', 'relative');
                        
                        if (json.repeat) {
                            //Create an event for ViewOut so it can be auto reset for repeat animation
                            $el.on('viewout', function(e){
                                e.stopPropagation();
                                //log('VIEWOUT ANIMATOR')
                                $(this).stop().css($(this).data('misoAnimator').JSON.start);       //Auto Reset style to 'start'
                                if (json.repeat) $(this).data('misoAnimator').reset = 1;    //Auto Mark that items is in reset state
                            });
                        }
                        
                        if (json.onView){
                            $el.on('viewin', function(e){
                                e.stopPropagation();
                                log('VIEWIN ANIMATOR')
                                $this.animate($(this));
                            });  
                        }
                    }
                    
                    //For Parallax Objects
                    
                
                });
                
            }
            
        },
        reset: function($els, options){
            var $this = this, opt = options.length > 1 ? options[1] : null;
            if (typeof $els == 'undefined' || !$els.length || !this.$els.length) return;
        
            //log('RESET Function called ...');
            //log($els);
        
            $els.each(function(i, el){
                var $el = $(el);
                var json = $el.data('misoAnimator').JSON;
            
                if (opt) $.extend(json, opt);
                $el.css(json.start);                    //Reset style to 'start'
                $el.data('misoAnimator').reset = 1;
                $el.data('misoAnimator').done = 0;
            });
        },
        animate: function($els, options){
            var $this = this, opt = (typeof options == 'object') ? options : null;
            if (typeof $els == 'undefined' || !$els.length || !this.$els.length) return;
            
            log('ANIMATE ... ');
            log($els);
            
            $els.each(function(i, el){
                var $el = $(el);
                
                if (!$el.data('misoAnimator')){
                    log('This object was not initiated for misoAnimator.');
                } else {
            
                    //Make sure the elements have the data
                    var json = $el.data('misoAnimator').JSON,
                        reset = $el.data('misoAnimator').reset, //for detecting reset state, for repeat animation (json.repeat = 1)
                        done = $el.data('misoAnimator').done;  //for detecting completion state, for one time animation (json.repeat = 0)
            
                    if (json){
                 
                        //Check if animation should continue to occur, and carry on ...
                        if (!done){
                 
                            //Allow override of settings
                            //log(opt)
                            if (opt) $.extend(json, opt);
                
                            //If 'stop' is not defined, make it 'false' as a default
                            if (typeof json.stop == 'undefined') json.stop = 1;
                
                
                            //===== RESET first, if needed
                            if (!reset) $el.css(json.start);
                
                            //====== ANIMATE
                            var delay = json.delay ? json.delay : 0,
                            options = {
                                'duration': json.duration ? json.duration : 1000,
                                'easing': json.easing ? json.easing : 'linear',
                                'queue': json.queue ? json.queue : false,
                                'complete': json.complete ? json.complete : $empty,
                                'start': json.start ? json.start : $empty
                            };
                
                            //log($el)
                            //log(delay)
                            if (json.stop) $el.stop();
                
                            if (delay){
                                (function(){ 
                                    //log('Fire animation')
                                    $el.animate(json.end, options); 
                                    $el.data('misoAnimator').reset = 0;
                                    if (!json.repeat) $el.data('misoAnimator').done = 1;
                                    $el = null;
                                }).delay(delay);
                            } else {
                                $el.animate(json.end, options);
                                $el.data('misoAnimator').reset = 0;
                                if (!json.repeat) $el.data('misoAnimator').done = 1;
                                $el = null;
                            }
                        } else {
                            $el = null;
                        }
                    }
                }
            
            });
        
        }
    });
	
    //$(document).ready(function ($) {
	//    pmAnimator = new misoAnimator($('[data-transition]'));
	//});
})(jQuery);