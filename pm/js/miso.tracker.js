/**
 * jQuery Miso Tracker - v1.0.0
 * Copyright (c) 2014 ProjectMiso, LLC
 * License: Restricted to approved license holders only. 
 *
 * @Description: misoTracker will track HTML objects and their positions in context of a scrollable container.
 * The container can be a scrollable box or the window, as the container context. The module 
 * will broadcast the locations of each object and their offsets in relevance to the context 
 * container. 
 *
 * Also the module can track sections of the page and broadcast which section is closest to the top and 
 * in better view so navigation can be worked out using the data. An event will be fired with the closest
 * section. The event is attached to the context element - default is the 'window'.
 *
 * @Initiate:
 * ---------------------------------------------------------------------------
 * var tracker = new misoTracker($('selector'), options);      //'selector' will be used to track the set of objects
 * 
 * All 'options' are optional.
 * 'options' include - 
 * options.context          Optional    CSS selector for the container (with scroll bars) context - default is the window
 * options.boundTo          Optional    CSS Context for an element to broadcast relative positions
 * options.sectionScrollDirection       Optional    The direction the sections scroll 'vertical'  or 'horizontal'. Default is 'vertical'
 * 
 * @Public Methods
 * ---------------------------------------------------------------------------
 * tracker.destroy($('selector'));      Removes the locator tracking for the selected elements
 * tracker.add($('selector'));          Adds one or more elements to track
 *
 * @HTML Data Properties
 * ---------------------------------------------------------------------------
 * data-misotracker-section     Set to any value. As long as this property exists, the module will
 *                              track the items as page sections
 *
 * @Events
 * ---------------------------------------------------------------------------
 * Element events - 
 * EL.Event     fullview        When all edges of the object comes within the viewport
 * EL.Event     fullviewout     When all an object goes from fullview to out of view or partial view
 * EL.Event     viewin          When any part of an object comes within the viewport
 * EL.Event     viewout         When all parts of an object goes out of the viewport
 * EL.Event     reachedtop      When an object scrolls up to the top of the viewport
 * EL.Event     reachedbottom   When an object scrolls down to the bottom of the viewport
 * EL.Event     reachedleft     When an object scrolls left to the left edge of the viewport
 * EL.Event     reachedright    When an object scrolls right to the right of the viewport
 *
 * Window events - 
 * window.Event sectionchange   When a section comes into proper view - i.e. nav can be changed
 *
 * @Broadcasted Data
 * ---------------------------------------------------------------------------
 * direction                    Scroll direction
 * container.scrollTop          Scrollable container 
 * container.scrollLeft
 * container.scrollBottom      Bottom edge of container + the scroll position
 * container.scrollRight       Right edge of container + the scroll position
 * container.width             Viewport width
 * container.height            Viewport height
 *
 * pos.top
 * pos.left
 * pos.width
 * pos.height
 * pos.fullView
 * pos.partialView
 * pos.outOfView
 * pos.topOffset       //from the top of the view port 
 * pos.bottomOffset    //from the bottom of the view port to the bottom of the object
 * pos.leftOffset      //from the left of the view port
 * pos.rightOffset     //from the right of the view port to the right of the object
 *
 * @Window Objects
 * ---------------------------------------------------------------------------
 * window.mTrackerData.direction   //Direction of scrolling
 * window.mTrackerData.$els        //All elements being tracked
 * window.mTrackerData.$visible    //All visible elements
 * window.mTrackerData.$section      Currently closest section
 *
**/

var misoTracker;
if (!window.mTrackerData) window.mTrackerData = {};

(function($){
    /*
     * Options may include - 
     *      options.context         Optional    CSS selector for the container (with scroll bars) context - default is the window
     *      options.boundTo         Optional    CSS Context for an element to broadcast relative positions
     */
    misoTracker = new Class({
        initialize: function(elements, options){
            var $this = this;
            if (typeof elements == 'undefined' || !elements.length) return;
            
            //========== INIT ===========
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
        
                //Create a storage for global values not part of the config
                this.globals = {};
                this.globals.$container = $(this.config.context);
                if (!this.globals.$sections) this.globals.$sections = $('nonexistant');                 //blank storage for sections
                
                this.misoTrackerTimer = 0; //A timer to delay the scroll event
                
                //Stop this if elements are not present
                if (!this.$els.length || !this.globals.$container) return;
            
                //log(this.$els);
            
                //======= Process the elements and window settings
                //Create a Global variable for storage
                
            
                //Initiate  blank storage for the visible elements
                if (!window.mTrackerData.$visible) window.mTrackerData.$visible = $('nonexistant');
                if (!window.mTrackerData.$section) window.mTrackerData.$section = $('nonexistant');
                if (!window.mTrackerData.$els) window.mTrackerData.$els = $('nonexistant');
            
                //Loop through each element and assign unique identity
                if (!window.mTrackerData.counter) window.mTrackerData.counter = 0;
            
                //Process and Add the elements into misoTracker
                this.add(this.$els, true);
            
                //Get container's view/position references
                var win = {};
                win.scrollTop = this.globals.$container.scrollTop();
                win.scrollLeft = this.globals.$container.scrollLeft();
            
                //Store window scroll position, this will help with detecting direction
                if (!this.globals.scrollPositions) this.globals.scrollPositions = {
                    'scrollTop': win.scrollTop, 
                    'scrollLeft': win.scrollLeft
                };
            
                //Attach the scroll event to the viewport/container
                this.globals.scrollUpdate = function(e){
                    //log(window.mTrackerData.$els);
                    $this._update();
                };
            
                //Figure out if the event is already attached
                var attachEvent = true, 
                    events = $._data(this.globals.$container[0], "events" );
                if (events != undefined && events.scroll != undefined){
                    for (i=0;i<events.scroll.length; i++){
                        if (events.scroll[i].handler == this.globals.scrollUpdate) attachEvent = false; //already attached
                    }
                }
                if (attachEvent) this.globals.$container.on('scroll', function(e){
                    //log('misoTracker INTERNALS: Window scroll called.');
                    //e.stopPropagation();
                    $clear(this.misoTrackerTimer);
                    this.misoTrackerTimer = $this.globals.scrollUpdate.delay(20, this, e);
                });
            
            }
            
            //Update the data, now
            $(window).on('resize', function(e){
                e.stopPropagation();
                //log('misoTracker INTERNALS: Window resize called.');
                $this._update();
            });
            this._update();
        },
        /*
         *  Method to update tracking info for objects in the set
         *  @$els    Required            The jquery elements to be added
         *  @init    Optional, Bool      Whether it is the initiation process (internal only)
         */
        _update: function(){
            var $this = this;
            if (!this.$els.length || !this.globals.$container.length) return;
            
        
            //=========== Context or Window position data ==========
            var direction = null, win = {};
        
            win.scrollTop = this.globals.$container.scrollTop();
            win.scrollLeft = this.globals.$container.scrollLeft();
            win.height = this.globals.$container.height();
            win.width = this.globals.$container.width();
            win.scrollBottom = win.scrollTop + win.height;
            win.scrollRight = win.scrollLeft + win.width;
        
            //compare stored position (past) with new position (present)
            if (this.globals.scrollPositions.scrollTop > win.scrollTop){ 
                direction = 'up';
            } else if (this.globals.scrollPositions.scrollTop < win.scrollTop){
                direction = 'down';
            }
            //log('Stored ' + this.globals.scrollPositions.scrollTop);
            //log('Current ' + win.scrollTop);
        
            if (!direction){
                if (this.globals.scrollPositions.scrollLeft > win.scrollLeft){
                    direction = 'left';
                } else if (this.globals.scrollPositions.scrollLeft < win.scrollLeft){
                    direction = 'right';
                }
            }
        
            //Set new positions
            this.globals.scrollPositions = {
                'scrollTop': win.scrollTop, 
                'scrollLeft': win.scrollLeft
            };
        
            if (this.config.context == window){
                window.mTrackerData.direction = direction;
            } else {
                this.globals.$container.data('direction') = direction;
            }
        
            //================ Detect and Update Positions and Sections ================
            //Temp Storage for visible and invisible items for the viewport/container
             var visibleNow = [], invisibleNow = [];
             var sections = {'id': [], 'score': []}; //Temp tracker for the sections 
         
            //LOOP through and Store info into the elements
            this.$els.each(function(i, item){
                var $el = $(item);
            
                //================= Detect Position of Elements in relations to the Viewport 
                //Element pos data 
                /* Available misoTracker position are - 
                 * pos.top
                 * pos.left
                 * pos.width
                 * pos.height
                 * pos.fullView
                 * pos.partialView
                 * pos.outOfView
                 * pos.topOffset       //from the top of the view port 
                 * pos.bottomOffset    //from the bottom of the view port to the bottom of the object
                 * pos.leftOffset      //from the left of the view port 
                 * pos.rightOffset     //from the right of the view port to the right of the object
                 */
                var pos = $el.offset();
                pos.left = $el.offset().left;
                pos.width = $el.outerWidth();
                pos.height = $el.outerHeight();
                pos.fullView = false;
                pos.partialView = false;
                pos.outOfView = false;
                pos.topOffset =  pos.top - win.scrollTop;
                pos.leftOffset = pos.left - win.scrollLeft;
                pos.bottomOffset = pos.top + pos.height - win.scrollBottom;
                pos.rightOffset = pos.left + pos.width - win.scrollRight;
                
                //log($el)
                //log(pos)
                //log(pos.topOffset + " = " + pos.top + " - " + win.scrollTop);
                //log(pos.bottomOffset + " = " + pos.top + " + " + pos.height + " - " + win.scrollBottom);
            
                //---------- Detect 'in view' flags so events can be fired based on views
            
                //Flag Variables for the view events
                var fireFullview = false, fireFullviewout = false, fireViewin = false, fireViewout = false;
            
                //------- Detect full view
                if (pos.topOffset >= 0 && pos.bottomOffset <= 0 && pos.leftOffset >= 0 && pos.rightOffset <= 0) pos.fullView = true;
            
                //log(pos.topOffset + ' >= 0 && ' + pos.top + ' < ' + win.scrollBottom + '  && ' +  pos.leftOffset + ' >= 0 && ' + pos.left + ' < ' + win.scrollRight);
            
                //------ Detect partial view 
                //log('Section: ' + $el.attr('id'))
                //top-left corner is in view
                if (pos.topOffset >= 0 && pos.top < win.scrollBottom && pos.leftOffset >= 0 && pos.left < win.scrollRight) {
                    if (!pos.fullView) pos.partialView = true;
                    //log('Partial View - top-left corner is in view');
                }
                //top-right corner is in view
                if (pos.top >= win.scrollTop && pos.top < win.scrollBottom && pos.left + pos.width >= win.scrollLeft && pos.left + pos.width < win.scrollRight) {
                    if (!pos.fullView && !pos.partialView) pos.partialView = true;
                    //log('Partial View - top-right corner is in view');
                }
                //bottom-right corner is view
                if (pos.top + pos.height >= win.scrollTop && pos.top + pos.height < win.scrollBottom &&  pos.left + pos.width >= win.scrollLeft && pos.left + pos.width < win.scrollRight) {
                    if (!pos.fullView && !pos.partialView) pos.partialView = true;
                    //log('Partial View - bottom-right corner is in view');
                }
                //bottom-left corner is view
                if (pos.top + pos.height >= win.scrollTop && pos.top + pos.height < win.scrollBottom && pos.left >= win.scrollLeft && pos.left < win.scrollRight) {
                    if (!pos.fullView && !pos.partialView) pos.partialView = true;
                    //log('Partial View - bottom-left corner is in view');
                }   
                //middle is in  view
                if ((pos.topOffset < 0 && pos.bottomOffset > 0) || (pos.leftOffset < 0 && pos.rightOffset > 0)) {
                    if (!pos.fullView && !pos.partialView) pos.partialView = true;
                    //log('Partial View - middle corner is in view');
                }
                //Detect outOfView
                if (!pos.fullView && !pos.partialView) pos.outOfView = true;
                
                var tempPos = $el.data('misoTracker'); 
                for (item in tempPos){
                    //log(tempPos[item])
                }
            
                if (!$el.data('misoTracker').pos.fullView && pos.fullView) fireFullview = true;
                if ($el.data('misoTracker').pos.fullView && !pos.fullView) fireFullviewout = true;
                if (!$el.data('misoTracker').pos.fullView && !$el.data('misoTracker').pos.partialView && (pos.fullView || pos.partialView))  fireViewin = true;
                if (($el.data('misoTracker').pos.fullView || $el.data('misoTracker').pos.partialView) && (!pos.fullView && !pos.partialView))  fireViewout = true;
                
                if (fireViewin){
                    //log(tempPos)
                    //log(pos)
                }
                
                //------------ Detect reaching of edges
                //Flag Variables for the view events
                var fireReachedtop = false, fireReachedbottom = false, fireReachedleft = false, fireReachedright = false;
            
                //Reached top
                if (pos.topOffset <= 0 && pos.height + pos.topOffset > 0 && pos.height + pos.topOffset <= pos.height){
                    if ($el.data('reachedtop') == undefined || $el.data('reachedtop') == false) {
                        fireReachedtop = true;
                        //log('Fire logic reached for reachedtop ' + $el.attr('id'));
                        $el.data('reachedtop', true);
                    }
                } else if (pos.topOffset > 0 || (pos.topOffset <= 0 && pos.height + pos.topOffset <= 0)){
                    if ($el.data('reachedtop') == undefined || $el.data('reachedtop') == true) {
                        $el.data('reachedtop', false);
                        //log('UnFire logic reached for reachedtop');
                    }
                }
                //Reached Bottom
                if (pos.bottomOffset >= 0 && pos.bottomOffset - pos.height < 0 && pos.bottomOffset - pos.height >= -pos.height){
                    if ($el.data('reachedbottom') == undefined || $el.data('reachedbottom') == false) {
                        fireReachedbottom = true;
                        //log('Fire logic reached for reachedbottom. ' + $el.attr('id'));
                        $el.data('reachedbottom', true);
                    }
                } else if (pos.bottomOffset < 0 || (pos.bottomOffset >= 0 &&  pos.bottomOffset - pos.height >= 0)){
                    if ($el.data('reachedbottom') == undefined || $el.data('reachedbottom') == true) {
                        $el.data('reachedbottom', false);
                        //log('UnFire logic reached for reachedbottom');
                    }
                }
            
                //Reached Left
                if (pos.leftOffset <= 0 && pos.width + pos.leftOffset > 0 && pos.width + pos.leftOffset <= pos.width){
                    if ($el.data('reachedleft') == undefined || $el.data('reachedleft') == false) {
                        fireReachedleft = true;
                        //log('Fire logic reached for reachedleft ' + $el.attr('id'));
                        $el.data('reachedleft', true);
                    }
                } else if (pos.topOffset > 0 || (pos.topOffset <= 0 && pos.height + pos.topOffset <= 0)){
                    if ($el.data('reachedleft') == undefined || $el.data('reachedleft') == true) {
                        $el.data('reachedleft', false);
                        //log('UnFire logic reached for reachedtop');
                    }
                }
                //Reached Right
                if (pos.rightOffset >= 0 && pos.rightOffset - pos.width < 0 && pos.rightOffset - pos.width >= -pos.width){
                    if ($el.data('reachedright') == undefined || $el.data('reachedright') == false) {
                        fireReachedright = true;
                        //log('Fire logic reached for reachedright. ' + $el.attr('id'));
                        $el.data('reachedright', true);
                    }
                } else if (pos.rightOffset < 0 || (pos.rightOffset >= 0 &&  pos.rightOffset - pos.width >= 0)){
                    if ($el.data('reachedright') == undefined || $el.data('reachedright') == true) {
                        $el.data('reachedright', false);
                        //log('UnFire logic reached for reachedbottom');
                    }
                }
                
                //Broadcast the values of views and positions
                $el.data('misoTracker').container = win;
                $el.data('misoTracker').direction = direction;
                $el.data('misoTracker').pos = pos;
                
            
                if (fireViewin) {
                    //log('fireViewin = ' + fireViewin);
                    //log($el)
                }
                if (fireViewout){
                    //log($el);
                    //log(pos)
                }
            
                
                //Fire event triggers
                if (fireFullview) $el.triggerHandler('fullview');
                if (fireFullviewout) $el.triggerHandler('fullviewout');
                if (fireViewin) $el.triggerHandler('viewin');
                if (fireViewout) $el.triggerHandler('viewout');
            
                if (fireReachedtop) $el.triggerHandler('reachedtop');
                if (fireReachedbottom) $el.triggerHandler('reachedbottom');
                if (fireReachedleft) $el.triggerHandler('reachedleft');
                if (fireReachedright) $el.triggerHandler('reachedright');
            
                //Set data for the window level data broadcast
                if (fireViewin)  visibleNow[visibleNow.length] = $el;
                if (fireViewout)  invisibleNow[invisibleNow.length] = $el;
            
                if ($el.data('misotracker-section') && (pos.fullView || pos.partialView)){
                    sections['id'][sections['id'].length] = $el.data('misotracker-id');
                    if ($this.config.sectionScrollDirection == 'vertical'){
                    
                        //get visible area
                        var area = pos.height, areaScore = 0;
                        if (pos.topOffset <= 0) area = area + pos.topOffset;
                        if (pos.bottomOffset >= 0) area = area - pos.bottomOffset;
                        areaScore = (area/win.height)*100;
                    
                        //get a distance score no more than 100, give preference to the closest objects
                        var distance = pos.topOffset == 0 ? 0.1 : Math.abs(pos.topOffset);
                        if (pos.topOffset > 0 && pos.topOffset < win.height/8) {
                            distance = distance / (1 + (100/distance));
                        } else if (pos.topOffset > 0 && pos.topOffset > win.height/8) {
                            distance = distance * (1 + (distance/20));
                        }
                        //log($el.attr('id') + ' topOffset = ' + pos.topOffset + ', distanceQuotient = ' + distance);
                    
                        var distanceScore = (100-(Math.abs(distance)/win.height)*100);
                        var score = areaScore + distanceScore;
                        
                        sections['score'][sections['score'].length] = score;
                    
                        //log($el.attr('id') + ' topOffset = ' + pos.topOffset + ', distanceScore = ' + distanceScore + ', area = ' + area + ', areaScore = ' + areaScore + ', score = ' + score);
                    
                    }
                }
            
                $el = null;
            });
            //================ Broadcast visible and invisible items to the window
        
            //Add visible and invisible items to a jQuery object
            var $v = $($.map(visibleNow, function(el){return $.makeArray(el)}));
            var $iv = $($.map(invisibleNow, function(el){return $.makeArray(el)}));
            //log($iv);
        
            //Add them back to the window object
            var varr = [$v, window.mTrackerData.$visible];
            window.mTrackerData.$visible = $($.map(varr, function(el){return $.makeArray(el)}));
        
            //Now take out the invisible items
            $iv.each(function(j, rem){
                window.mTrackerData.$visible.each(function(i, item){
                    if ($(rem).data('misotracker-id') == $(item).data('misotracker-id')) {
                        window.mTrackerData.$visible.splice(i, 1); 
                        //log('Remove from visible ...');
                    }
                });
            });
        
        
            //=================== Track sections and broadcast to the window
            //log('Section ID');
            //log(sections.id)
            if (sections.id.length){
                var topScore = 0, id = null, theSection = $('nonexistant');
            
                for (i=0;i<sections.id.length;i++){
                   if (sections['score'][i] > topScore) {
                        topScore = sections['score'][i];
                        id = sections['id'][i]
                   }
               
                   //topScore = sections['score'][i] > topScore ? sections['score'][i] : topScore;
                }
                //log('Top score: ' + topScore + ' ID: ' +  id);
                //log(theSection);
            
                theSection = $('[data-misotracker-id=' + id + ']');
            
                if (window.mTrackerData.$section.data('misotracker-id') != theSection.data('misotracker-id')){
                    window.mTrackerData.$section = theSection;
                    $(window).trigger('sectionchange');
                    //log('Window EVENT sectionchange fired');
                }
            }
        
            //log('===============');
        
        },
        /*
         *  Adds one or more elements to the set of elements
         * @$els    Required            The jquery elements to be added
         * @init    Optional, Bool      Whether it is the initiation process (internal only)
         */
        add: function($els, init){
            var $this = this;
            if (typeof $els == 'undefined' || !$els.length || !this.globals.$container.length) return;
        
            //log('misoTracker.add ...');
            //log($els);
        
            //Only for non-init execution
            if (!init){
                //Remove possible duplicates from the set
                this.$els.each(function(i, item1){
                    $els.each(function(j, item2){
                        if (item1 == item2) $els.splice(j, 1); 
                    });
                });
            }
        
            //Process the elements. 
            //Find the sections for section tracking
            var sections = [];
            $els.each(function(i, item){
                var $el = $(item);
            
                //Set a unique ID
                $el.attr('data-misotracker-id', window.mTrackerData.counter);
                window.mTrackerData.counter++; //ID counter
                $el.data('misoTracker', {'pos': {}, 'container': {}, 'direction': null })
                
                //find the sections
                if ($el.data('misotracker-section')) sections[sections.length] = $el;
                
                //Add event handlers
                $el.on('viewin', $empty);
                $el.on('viewout', $empty);
                $el.on('fullview', $empty);
                $el.on('fullviewout', $empty);
        
                $el.on('reachedtop', $empty);
                $el.on('reachedbottom', $empty);
                $el.on('reachedleft', $empty);
                $el.on('reachedright', $empty);
            
                $el = null;
            });
        
            //Store the sections
            var $sections = $($.map(sections, function(el){return $.makeArray(el)}));
            if (!this.globals.$sections.length){
                this.globals.$sections = $($.map(sections, function(el){return $.makeArray(el)}));
            } else {
                this.globals.$sections.add($sections);
            }
            $sections = sections = null;
            
            
            
        
            //Add the elements to the set of elements
            if (!init) {
                this.$els = $($.map([this.$els, $els], function(el){return $.makeArray(el)}));
                //log(this.$els)
            }
        
            if (!window.mTrackerData.$els.length) {
                window.mTrackerData.$els = $els;
            } else {
                window.mTrackerData.$els = $($.map([window.mTrackerData.$els, $els], function(el){return $.makeArray(el)}));
            }
        
            $els = null;
        
            //Call the update function
            if (!init) this._update();
        
        },
        /*
         *  Removes one or more elements from the set of elements and destroys their tracker data
         */
       destroy: function($els){
            var $this = this;
            if ($els.length || !this.$els.length || !this.globals.$container.length) return;
        
            //log('Destroy ... ');
            //log(this.$els);
        
            //Remove the element from storage
            window.mTrackerData.$els.each(function(i, item1){
                $els.each(function(j, item2){
                    if (item1 == item2) window.mTrackerData.$els.splice(i, 1); 
                });
            
                //if ($el.data('misotracker-id') == $(item).data('misotracker-id')) window.mTrackerData.$els.splice(i, 1); 
            });
            this.$els.each(function(i, item1){
                $els.each(function(j, item2){
                    if (item1 == item2) $this.$els.splice(i, 1); 
                });
                //if ($el.data('misotracker-id') == $(item).data('misotracker-id')) $this.$els.splice(i, 1); 
            });
            this.globals.$sections.each(function(i, item1){
                $els.each(function(j, item2){
                    if (item1 == item2) $this.globals.$sections.splice(i, 1); 
                });
                //if ($el.data('misotracker-id') == $(item).data('misotracker-id')) $this.globals.$sections.splice(i, 1); 
            });
        
            //Remove data
            $els.removeData('misoTracker');
            $els.removeData('misotracker-id');
            $els.removeattr('data-misotracker-id');
            $els.off( "fullview");
            $els.off( "fullviewout");
            $els.off( "viewin");
            $els.off( "viewout");
        
            $els.off( "reachedtop");
            $els.off( "reachedbottom");
            $els.off( "reachedleft");
            $els.off( "reachedright");
            $els = null;
        
            //log(this.$els);
        
        }
    });
    
    
})(jQuery);
