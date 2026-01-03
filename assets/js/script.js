(function ($) {
    "use strict";

    /* ==========================================================================
       DOCUMENT READY
       ========================================================================== */
    $(document).ready(function () {

        /* ----------------------------------------
           NAV COLLAPSE
        ---------------------------------------- */
        $('.nav-link-click').on('click', function () {
            $('.navbar-collapse').collapse('hide');
        });

        /* ----------------------------------------
           HEADER STYLE FUNCTION
        ---------------------------------------- */
        function headerStyle() {
            if (!$('.main-header').length) return;
            
            var windowpos = $(window).scrollTop();
            var siteHeader = $('.main-header');
            var scrollLink = $('.scroll-top');

            if (windowpos >= 150) {
                siteHeader.addClass('fixed-header');
                scrollLink.fadeIn(300);
            } else {
                siteHeader.removeClass('fixed-header');
                scrollLink.fadeOut(300);
            }
        }

        /* ----------------------------------------
           SCROLL TO TOP - INITIALIZE
        ---------------------------------------- */
        var progressWrap = $('.progress-wrap');
        var progressPath = progressWrap.find('path')[0];
        
        if (progressPath) {
            var pathLength = progressPath.getTotalLength();
            
            // Setup progress circle
            progressPath.style.transition = 'none';
            progressPath.style.strokeDasharray = pathLength + ' ' + pathLength;
            progressPath.style.strokeDashoffset = pathLength;
            progressPath.getBoundingClientRect();
            progressPath.style.transition = 'stroke-dashoffset 10ms linear';
            
            // Update progress function
            function updateProgress() {
                var scroll = $(window).scrollTop();
                var height = $(document).height() - $(window).height();
                var progress = pathLength - (scroll * pathLength / height);
                progressPath.style.strokeDashoffset = progress;
            }
            
            // Click handler
            progressWrap.on('click', function (e) {
                e.preventDefault();
                $('html, body').animate({ scrollTop: 0 }, 550);
            });
            
            // Scroll handler
            $(window).on('scroll', function () {
                updateProgress();
                headerStyle();
                
                if ($(this).scrollTop() > 150) {
                    progressWrap.addClass('active-progress');
                } else {
                    progressWrap.removeClass('active-progress');
                }
            });
            
            // Initial update
            updateProgress();
        }

        /* ----------------------------------------
           DROPDOWN MENU
        ---------------------------------------- */
        var mobileWidth = 992;
        var navcollapse = $('.navigation li.dropdown');

        navcollapse.hover(
            function () {
                if ($(window).innerWidth() >= mobileWidth) {
                    $(this).children('ul').stop(true, false, true).slideToggle(300);
                    $(this).children('.megamenu').stop(true, false, true).slideToggle(300);
                }
            },
            function () {
                if ($(window).innerWidth() >= mobileWidth) {
                    $(this).children('ul').stop(true, false, true).slideToggle(300);
                    $(this).children('.megamenu').stop(true, false, true).slideToggle(300);
                }
            }
        );

        if ($('.main-header .navigation li.dropdown ul').length) {
            $('.main-header .navigation li.dropdown').append(
                '<div class="dropdown-btn"><span class="fas fa-chevron-down"></span></div>'
            );

            $('.main-header .navigation li.dropdown .dropdown-btn').on('click', function () {
                $(this).prev('ul').slideToggle(500);
                $(this).prev('.megamenu').slideToggle(800);
            });

            $('.navigation li.dropdown > a').on('click', function (e) {
                e.preventDefault();
            });
        }

        /* ----------------------------------------
           COUNTER ANIMATION
        ---------------------------------------- */
        if ($.fn.appear && $('.counter-text-wrap').length) {
            $('.counter-text-wrap').appear(function () {
                var $t = $(this);
                var n = $t.find(".count-text").attr("data-stop");
                var r = parseInt($t.find(".count-text").attr("data-speed"), 10);

                if (!$t.hasClass("counted")) {
                    $t.addClass("counted");
                    $({ countNum: $t.find(".count-text").text() }).animate(
                        { countNum: n },
                        {
                            duration: r,
                            easing: "linear",
                            step: function () {
                                $t.find(".count-text").text(Math.floor(this.countNum));
                            },
                            complete: function () {
                                $t.find(".count-text").text(this.countNum);
                            }
                        }
                    );
                }
            }, { accY: 0 });
        }

        /* ----------------------------------------
           SCROLL TO TARGET
        ---------------------------------------- */
        $('.scroll-to-target').on('click', function () {
            var target = $(this).attr('data-target');
            if ($(target).length) {
                $('html, body').animate({ scrollTop: $(target).offset().top }, 1000);
            }
        });

        /* ----------------------------------------
           NICE SELECT
        ---------------------------------------- */
        if ($.fn.niceSelect && $('select').length) {
            $('select').niceSelect();
        }

        /* ----------------------------------------
           WOW ANIMATION
        ---------------------------------------- */
        if (typeof WOW !== 'undefined' && $('.wow').length) {
            new WOW({
                boxClass: 'wow',
                animateClass: 'animated',
                offset: 0,
                mobile: false,
                live: true
            }).init();
        }

        /* ----------------------------------------
           PROJECT FILTER & ISOTOPE
        ---------------------------------------- */
        var $projectGrid = $('.project-masonry-active');
        
        if ($projectGrid.length && $.fn.isotope && $.fn.imagesLoaded) {
            // Initialize Isotope
            $projectGrid.imagesLoaded(function () {
                $projectGrid.isotope({
                    itemSelector: '.item',
                    layoutMode: 'fitRows',
                    percentPosition: true
                });
            });

            // Filter on click
            $('.project-filter li').on('click', function () {
                $('.project-filter li').removeClass('current');
                $(this).addClass('current');

                var selector = $(this).attr('data-filter');
                $projectGrid.isotope({ filter: selector });
            });
        }

        /* ----------------------------------------
           MAGNIFIC POPUP
        ---------------------------------------- */
        if ($.fn.magnificPopup) {
            if ($('.work-popup').length) {
                $('.work-popup').magnificPopup({
                    type: 'image',
                    removalDelay: 300,
                    mainClass: 'mfp-with-zoom',
                    gallery: { enabled: true },
                    zoom: { enabled: false }
                });
            }

            if ($('.popup-youtube, .popup-vimeo, .popup-gmaps').length) {
                $('.popup-youtube, .popup-vimeo, .popup-gmaps').magnificPopup({
                    disableOn: 700,
                    type: 'iframe',
                    mainClass: 'mfp-fade',
                    removalDelay: 160,
                    preloader: false,
                    fixedContentPos: false
                });
            }
        }

        /* ----------------------------------------
           TESTIMONIAL SLIDER
        ---------------------------------------- */
        if ($.fn.slick && $('.testimonials-wrap').length) {
            $('.testimonials-wrap').slick({
                dots: false,
                infinite: true,
                autoplay: true,
                autoplaySpeed: 2000,
                arrows: true,
                speed: 1000,
                focusOnSelect: false,
                prevArrow: '.testimonial-prev',
                nextArrow: '.testimonial-next',
                slidesToShow: 2,
                slidesToScroll: 1,
                responsive: [{
                    breakpoint: 767,
                    settings: { slidesToShow: 1 }
                }]
            });
        }

        /* ----------------------------------------
           MAP TOGGLE
        ---------------------------------------- */
        if ($('.map').length) {
            $('.map').hide();

            $('.map_title').on('click', function () {
                $('.map').show(500);
                $('.map_title').hide(500);
            });

            $('.close_btn').on('click', function () {
                $('.map').hide(500);
                $('.map_title').show(500);
            });
        }

        /* ----------------------------------------
           SCROLLER ANIMATION
        ---------------------------------------- */
        var scrollers = document.querySelectorAll(".scroller");
        
        if (scrollers.length && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            scrollers.forEach(function (scroller) {
                scroller.setAttribute("data-animated", "true");
                
                var scrollerInner = scroller.querySelector(".scroller__inner");
                if (!scrollerInner) return;
                
                var scrollerContent = Array.from(scrollerInner.children);
                scrollerContent.forEach(function (item) {
                    var duplicatedItem = item.cloneNode(true);
                    duplicatedItem.setAttribute("aria-hidden", "true");
                    scrollerInner.appendChild(duplicatedItem);
                });
            });
        }

        // Initial header style
        headerStyle();

    }); // End document ready

    /* ==========================================================================
       WINDOW RESIZE
       ========================================================================== */
    $(window).on('resize', function () {
        var navcollapse = $('.navigation li.dropdown');
        navcollapse.children('ul').hide();
        navcollapse.children('.megamenu').hide();
    });

    /* ==========================================================================
       WINDOW LOAD
       ========================================================================== */
    $(window).on('load', function () {
        
        // Fade out preloader elements
        $('.loadersss').fadeOut();
        $('#preloader-areasss').delay(350).fadeOut('slow');

        // GSAP Preloader Animation
        if (typeof gsap !== 'undefined') {
            var svg = document.getElementById("preloaderSvg");
            if (svg) {
                var tl = gsap.timeline();
                var curve = "M0 502S175 272 500 272s500 230 500 230V0H0Z";
                var flat = "M0 2S175 1 500 1s500 1 500 1V0H0Z";

                tl.to(".preloader-heading .load-text, .preloader-heading .cont", {
                    delay: 1.5,
                    y: -100,
                    opacity: 0
                });
                tl.to(svg, {
                    duration: 0.5,
                    attr: { d: curve },
                    ease: "power2.easeIn"
                }).to(svg, {
                    duration: 0.5,
                    attr: { d: flat },
                    ease: "power2.easeOut"
                });
                tl.to(".preloader", { y: -1500 });
                tl.to(".preloader", {
                    zIndex: -1,
                    display: "none"
                });
            }
        }

        // Re-layout Isotope after all images loaded
        if ($.fn.isotope && $.fn.imagesLoaded) {
            var $projectGrid = $('.project-masonry-active');
            var $blogGrid = $('.blog-standard-wrap');
            
            if ($projectGrid.length) {
                $projectGrid.imagesLoaded(function () {
                    $projectGrid.isotope('layout');
                });
            }
            
            if ($blogGrid.length) {
                $blogGrid.imagesLoaded(function () {
                    $blogGrid.isotope({
                        itemSelector: '.item',
                        layoutMode: 'fitRows',
                        percentPosition: true
                    });
                });
            }
        }

    }); // End window load

})(jQuery);