(function ($) {
    "use strict";

    /* ==========================================================================
       DOCUMENT READY
       ========================================================================== */
    $(function () {

        /* ----------------------------------------
           NAV COLLAPSE
        ---------------------------------------- */
        $('.nav-link-click').on('click', function () {
            $('.navbar-collapse').collapse('hide');
        });

        /* ----------------------------------------
           HEADER STYLE (SHARED)
        ---------------------------------------- */
        function headerStyle() {
            var windowpos = $(window).scrollTop();
            var siteHeader = $('.main-header');
            var scrollLink = $('.scroll-top');

            if (!siteHeader.length) return;

            if (windowpos >= 150) {
                siteHeader.addClass('fixed-header');
                scrollLink.fadeIn(300);
            } else {
                siteHeader.removeClass('fixed-header');
                scrollLink.fadeOut(300);
            }
        }

        /* ----------------------------------------
           DROPDOWN MENU
        ---------------------------------------- */
        var mobileWidth = 992;
        var navcollapse = $('.navigation li.dropdown');

        navcollapse.on('mouseenter mouseleave', function () {
            if ($(window).innerWidth() >= mobileWidth) {
                $(this).children('ul, .megamenu').stop(true, true).slideToggle(300);
            }
        });

        if ($('.main-header .navigation li.dropdown ul').length) {
            $('.main-header .navigation li.dropdown')
                .append('<div class="dropdown-btn"><span class="fas fa-chevron-down"></span></div>');

            $('.dropdown-btn').on('click', function () {
                $(this).siblings('ul, .megamenu').slideToggle(500);
            });

            $('.navigation li.dropdown > a').on('click', function (e) {
                e.preventDefault();
            });
        }

        /* ----------------------------------------
           SCROLL TO TOP BUTTON
        ---------------------------------------- */
        $('.scroll-to-target').on('click', function () {
            var target = $(this).data('target');
            if ($(target).length) {
                $('html, body').animate({ scrollTop: $(target).offset().top }, 1000);
            }
        });

        /* ----------------------------------------
           PROJECT FILTER
        ---------------------------------------- */
        $('.project-filter li').on('click', function () {
            $('.project-filter li').removeClass('current');
            $(this).addClass('current');

            var selector = $(this).data('filter');

            if ($.fn.imagesLoaded && $.fn.isotope) {
                $('.project-masonry-active').imagesLoaded(function () {
                    $('.project-masonry-active').isotope({
                        itemSelector: '.item',
                        filter: selector,
                        masonry: { columnWidth: '.item' }
                    });
                });
            }
        });

        /* ----------------------------------------
           NICE SELECT
        ---------------------------------------- */
        if ($.fn.niceSelect) {
            $('select').niceSelect();
        }

        /* ----------------------------------------
           WOW ANIMATION
        ---------------------------------------- */
        if (typeof WOW === 'function') {
            new WOW({ mobile: false }).init();
        }

        /* ----------------------------------------
           MAGNIFIC POPUP
        ---------------------------------------- */
        if ($.fn.magnificPopup) {
            $('.work-popup').magnificPopup({
                type: 'image',
                gallery: { enabled: true }
            });

            $('.popup-youtube, .popup-vimeo, .popup-gmaps').magnificPopup({
                type: 'iframe'
            });
        }

        /* ----------------------------------------
           TESTIMONIAL SLIDER
        ---------------------------------------- */
        if ($.fn.slick && $('.testimonials-wrap').length) {
            $('.testimonials-wrap').slick({
                infinite: true,
                autoplay: true,
                arrows: true,
                slidesToShow: 2,
                responsive: [{ breakpoint: 767, settings: { slidesToShow: 1 } }]
            });
        }

        /* ----------------------------------------
           MAP TOGGLE
        ---------------------------------------- */
        $('.map').hide();

        $('.map_title').on('click', function () {
            $('.map').show(500);
            $(this).hide(500);
        });

        $('.close_btn').on('click', function () {
            $('.map').hide(500);
            $('.map_title').show(500);
        });

        /* ----------------------------------------
           SCROLLER ANIMATION (SAFE)
        ---------------------------------------- */
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            $('.scroller').each(function () {
                var inner = this.querySelector('.scroller__inner');
                if (!inner) return;

                this.setAttribute('data-animated', true);
                Array.from(inner.children).forEach(function (item) {
                    var clone = item.cloneNode(true);
                    clone.setAttribute('aria-hidden', true);
                    inner.appendChild(clone);
                });
            });
        }

        /* ----------------------------------------
           SINGLE SCROLL HANDLER
        ---------------------------------------- */
        $(window).on('scroll', function () {
            headerStyle();

            var progressPath = document.querySelector('.progress-wrap path');
            if (!progressPath) return;

            var pathLength = progressPath.getTotalLength();
            var scroll = $(window).scrollTop();
            var height = $(document).height() - $(window).height();
            progressPath.style.strokeDashoffset =
                pathLength - (scroll * pathLength / height);

            $('.progress-wrap').toggleClass('active-progress', scroll > 150);
        });

        headerStyle();
    });

    /* ==========================================================================
       WINDOW LOAD (SINGLE)
       ========================================================================== */
    $(window).on('load', function () {

        $('.loadersss').fadeOut();
        $('#preloader-areasss').delay(350).fadeOut('slow');

        if ($.fn.imagesLoaded && $.fn.isotope) {
            $('.project-masonry-active, .blog-standard-wrap').imagesLoaded(function () {
                $(this).isotope({ itemSelector: '.item' });
            });
        }

        if (typeof gsap !== 'undefined') {
            const svg = document.getElementById("preloaderSvg");
            if (!svg) return;

            gsap.timeline()
                .to(".preloader-heading .load-text, .preloader-heading .cont", {
                    y: -100, opacity: 0, delay: 1.5
                })
                .to(svg, { duration: 0.5, attr: { d: "M0 502S175 272 500 272s500 230 500 230V0H0Z" } })
                .to(svg, { duration: 0.5, attr: { d: "M0 2S175 1 500 1s500 1 500 1V0H0Z" } })
                .to(".preloader", { y: -1500 })
                .set(".preloader", { display: "none" });
        }
    });

})(jQuery);
