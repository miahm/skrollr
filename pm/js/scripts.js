var s = skrollr.init();

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
    
    //================ GLOBAL Functions ================
    var resizeLayout = function(){
        //Intro scene 1
        var intro_scene1 = $('intro_logo_scene');
        intro_scene1.css('height', $(window).height() + 500);
        
        //intro scene 2
        var intro_scene2 = $('section.intro_scene2');
        intro_scene2.css('height', $(window).height() + 800);
        
        //intro scene 3
        var intro_scene3 = $('section.intro_scene3');
        intro_scene3.css('height', $(window).height() + 800);
        
    };
    resizeLayout();
    
    
    
    //-------- INTRO Scene 1 ------
    
    
    //------- INTRO Scene 2 -------
    
    
});