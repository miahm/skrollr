var s = skrollr.init();
var iOS = ( navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false );

/*
 *  Method to AUTO Scroll
 * Store anchors in an array
 */
var scrollAnchors = [
    //Scene 1
    0,          //Scene 1
    
    //Scene 2
    //540,          //Scene 2, Heading 1
    //950,          //Scene 2, Heading 2
    //1290,         //Scene 2, Heading 3
    //1690,         //Scene 2, blurb
    
    2000,           //Navigation
    
    //Scene 3
    //2940,         //Scene 3, Heading 1
    //3290,         //Scene 3, Heading 2
    //3630,         //Scene 3, Heading 3
    4030,           //Scene 3, blurb
    
    //Scene 4
    //5300,         //Scene 4, H1
    6000,           //Scene 4, slide 1
    7400,           //Scene 4, slide 2
    8800,           //Scene 4, slide 3
    
    //Scene 5
    17500           //Scene 5, stripes    
]
//Method to find the next anchor based on direction
var findAnchor = function (direction, section){
    var scrollPosition = $(window).scrollTop(),
        finalAnchor;
    
    for (i=0;i<scrollAnchors.length;i++){
        
        if (scrollPosition < scrollAnchors[i]){
            //log(direction + ', ' + scrollPosition + ' < ' + scrollAnchors[i]);
            if (direction == 'down') {
                finalAnchor = scrollAnchors[i];
                break;
            } else if (direction == 'up') {
                finalAnchor = scrollAnchors[i-1];
                break;
            }
        } else if (scrollPosition == scrollAnchors[i]){
            //log(direction + ', ' + scrollPosition + ' == ' + scrollAnchors[i]);
            if (direction == 'down') {
                finalAnchor = scrollAnchors[i+1];
                break;
            } else if (direction == 'up') {
                finalAnchor = scrollAnchors[i-1];
                break;
            }
        }
    }
    //log('finalAnchor ' + finalAnchor);
    if (finalAnchor != undefined){
        var distance = Math.abs(finalAnchor - scrollPosition),
            speed = distance*2,
            easing = 'easeInOutCirc';
        
        if (speed > 5500) {
            speed = 5500; 
            //easing = 'easeInQuart'; //exception for the clients page
        }
        
        
        $('html,body').stop().animate({
              scrollTop: finalAnchor,
              easing: easing
        }, speed);
    }
};



jQuery(document).ready(function ($) {
    //=============== GLOBAL Events ================
    $(window).on('load', function(){
        //get rid of the loading scene
        $('body').removeClass('body_overlay_style');
        $('.loading_overlay').remove();
    });
    
    $(window).on('resize', function(e){
        //call the resizer function
        resizeLayout();
    });
    
    //AUTo Scroll events
    $(window).on('keydown', function(e){
        //log(e.which)
        if ((e.which === 32 && !e.shiftKey) || e.which == 40 || e.which == 39) {
            e.preventDefault();
            //log('Move down ...' + $(window).scrollTop());
            findAnchor('down');
        }
        if ((e.which === 32 && e.shiftKey) || e.which == 38 || e.which == 37) {
            e.preventDefault();
            //log('Move up ...' + $(window).scrollTop());
            findAnchor('up');
        }
    });
    $('a.logo').on('click touch', function(e){
        e.preventDefault();
        window.scrollTo(0, 0);
    });
    
    //================ GLOBAL Functions ================
    var resizeLayout = function(){/*
        //Intro scene 1
        var intro_scene1 = $('section.intro_logo_scene');
        intro_scene1.css('height', $(window).height() + 500);
        
        //intro scene 2
        var intro_scene2 = $('section.intro_scene2');
        intro_scene2.css('height', $(window).height() + 800);
        
        //intro scene 3
        var intro_scene3 = $('section.intro_scene3');
        intro_scene3.css('height', $(window).height() + 800);
        
        //intro scene 4
        var intro_scene4 = $('section.intro_scene4');
        intro_scene4.css('height', $(window).height() + 800);
        */
        
        //Scene 4 BLURB
        var sene4Blurb = $('.intro_scene4 .blurb');
        sene4Blurb.css('width', $(window).width()*0.55);
        sene4Blurb = null;
        
        //Slide one positioning
        //var sene4BlurbLeft = $('.intro_scene4 .one.left .blurb'),
        //    sene4BlurbRight = $('.intro_scene4 .one.right .blurb');
        //sene4BlurbLeft.css('right', -sene4BlurbLeft.width()/2);
        //sene4BlurbRight.css('left', -sene4BlurbRight.width()/2);
        
    };
    resizeLayout();
    
    
    
    //-------- INTRO Scene 1 ------
    var videoBG = function(action){ //action == 'add' or 'remove'
        var box = $('.video_BG');
        if (action == 'add'){
            box.addClass('active');
            box.videoBG({
                mp4:'images/tunnel_animation.mp4',
                ogv:'images/tunnel_animation.ogv',
                webm:'images/tunnel_animation.webm',
                //poster:'images/tunnel_animation.jpg',
                scale:true,
                fullscreen: true,
                zIndex:0,
                opacity: .3
            });
        } else {
            box.empty();
            box.removeClass('active');
        }
    };
    if (!iOS) videoBG('add');
    
    
    var scrollIconAnimate = function(){
        $('img.scroll.icon').animate({'top':10}, {'easing': 'easeInQuint', duration: 800, complete: scrollIconAnimate })
            .animate({'top': 0}, {'easing': 'easeOutQuint', duration: 600, complete: scrollIconAnimate });
    }
    
    $('img.scroll.icon').css('position', 'relative');
    scrollIconAnimate();

    
    
    //------- INTRO Scene 2 -------
    
    
});