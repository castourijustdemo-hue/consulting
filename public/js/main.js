    const initApp = () => {
      /* --------------------------------------------------------------------
         1. PRELOADER
         -------------------------------------------------------------------- */
      const preloader = document.getElementById('preloader');
      if (preloader) {
        preloader.classList.add('hidden');
        setTimeout(() => { preloader.style.display = 'none'; }, 400);
      }

      /* --------------------------------------------------------------------
         2. DARK / LIGHT THEME TOGGLE (PERSISTENT)
         -------------------------------------------------------------------- */
      const htmlEl = document.documentElement;
      const themeToggle = document.getElementById('themeToggle');
      const iconSun = document.getElementById('themeIconSun');
      const iconMoon = document.getElementById('themeIconMoon');

      const applyTheme = (theme) => {
        htmlEl.setAttribute('data-theme', theme);
        localStorage.setItem('vs-theme', theme);
        if (theme === 'dark') {
          iconSun.style.display = 'block';
          iconMoon.style.display = 'none';
        } else {
          iconSun.style.display = 'none';
          iconMoon.style.display = 'block';
        }
      };

      const savedTheme = localStorage.getItem('vs-theme') || 'light';
      applyTheme(savedTheme);

      themeToggle.addEventListener('click', () => {
        const next = htmlEl.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        applyTheme(next);
      });

      /* --------------------------------------------------------------------
         3. STICKY NAVIGATION, SCROLL PROGRESS & BACK-TO-TOP
         -------------------------------------------------------------------- */
      const navbar = document.getElementById('navbar');
      const scrollProgress = document.getElementById('scrollProgress');
      const backToTopBtn = document.getElementById('backToTopBtn');
      const footerBackToTop = document.getElementById('footerBackToTop');
      const parallaxEls = document.querySelectorAll('[data-parallax]');

      const handleScroll = () => {
        const scrollY = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;

        scrollProgress.style.width = `${progress}%`;

        if (scrollY > 50) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }

        if (scrollY > 500) {
          backToTopBtn.classList.add('visible');
        } else {
          backToTopBtn.classList.remove('visible');
        }

        // Subtle Parallax Effect
        parallaxEls.forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            const offset = (rect.top - window.innerHeight / 2) * -0.04;
            el.style.transform = `translateY(${offset.toFixed(1)}px)`;
          }
        });
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();

      const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
      backToTopBtn.addEventListener('click', scrollToTop);
      footerBackToTop.addEventListener('click', scrollToTop);

      /* --------------------------------------------------------------------
         4. MOBILE HAMBURGER MENU & MEGA DROPDOWN ACCESSIBILITY
         -------------------------------------------------------------------- */
      const hamburgerBtn = document.getElementById('hamburgerBtn');
      const mobileDrawer = document.getElementById('mobileDrawer');
      const servicesDropdown = document.getElementById('servicesDropdown');

      const toggleMobileMenu = (forceState) => {
        const isOpen = typeof forceState === 'boolean' ? forceState : !mobileDrawer.classList.contains('open');
        mobileDrawer.classList.toggle('open', isOpen);
        hamburgerBtn.classList.toggle('active', isOpen);
        hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
        mobileDrawer.setAttribute('aria-hidden', String(!isOpen));
        document.body.style.overflow = isOpen ? 'hidden' : '';
      };

      hamburgerBtn.addEventListener('click', () => toggleMobileMenu());

      mobileDrawer.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => toggleMobileMenu(false));
      });

      // Keyboard toggle for mega menu
      const dropdownTrigger = servicesDropdown.querySelector('a');
      dropdownTrigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const expanded = servicesDropdown.classList.toggle('open');
          dropdownTrigger.setAttribute('aria-expanded', String(expanded));
        }
      });

      /* --------------------------------------------------------------------
         5. ACTIVE SECTION SCROLL-SPY
         -------------------------------------------------------------------- */
      const sections = document.querySelectorAll('section[id]');
      const navLinks = document.querySelectorAll('.nav-link[data-nav]');

      const sectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const id = entry.target.getAttribute('id');
              navLinks.forEach((link) => {
                link.classList.toggle('active', link.getAttribute('data-nav') === id);
              });
            }
          });
        },
        { rootMargin: '-35% 0px -55% 0px' }
      );

      sections.forEach((sec) => sectionObserver.observe(sec));

      /* --------------------------------------------------------------------
         6. SCROLL REVEAL & PROCESS TIMELINE ANIMATION
         -------------------------------------------------------------------- */
      const revealEls = document.querySelectorAll('.reveal');
      const processTimeline = document.getElementById('processTimeline');
      const processLineFill = document.getElementById('processLineFill');

      const revealObserver = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12 }
      );

      revealEls.forEach((el) => revealObserver.observe(el));

      if (processTimeline && processLineFill) {
        const timelineObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                const isMobile = window.innerWidth <= 960;
                if (isMobile) {
                  processLineFill.style.height = '100%';
                } else {
                  processLineFill.style.width = '100%';
                }
                processTimeline.querySelectorAll('.process-step').forEach((step, idx) => {
                  setTimeout(() => step.classList.add('active'), idx * 240);
                });
              }
            });
          },
          { threshold: 0.25 }
        );
        timelineObserver.observe(processTimeline);
      }

      /* --------------------------------------------------------------------
         7. ANIMATED NUMBER COUNTERS
         -------------------------------------------------------------------- */
      const counters = document.querySelectorAll('.counter');
      const animateCounter = (el) => {
        const target = parseInt(el.getAttribute('data-target'), 10);
        const suffix = el.getAttribute('data-suffix') || '';
        const duration = 1600;
        const startTime = performance.now();

        const step = (now) => {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.round(target * eased);
          el.textContent = `${current.toLocaleString()}${suffix}`;
          if (progress < 1) {
            requestAnimationFrame(step);
          }
        };
        requestAnimationFrame(step);
      };

      const counterObserver = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCounter(entry.target);
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.4 }
      );

      counters.forEach((c) => counterObserver.observe(c));

      /* --------------------------------------------------------------------
         8. CUSTOM CURSOR (DESKTOP POINTERS ONLY)
         -------------------------------------------------------------------- */
      const cursorDot = document.getElementById('cursorDot');
      const cursorRing = document.getElementById('cursorRing');
      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

        window.addEventListener('mousemove', (e) => {
          mouseX = e.clientX;
          mouseY = e.clientY;
          cursorDot.style.left = `${mouseX}px`;
          cursorDot.style.top = `${mouseY}px`;
        });

        const renderCursor = () => {
          ringX += (mouseX - ringX) * 0.18;
          ringY += (mouseY - ringY) * 0.18;
          cursorRing.style.left = `${ringX}px`;
          cursorRing.style.top = `${ringY}px`;
          requestAnimationFrame(renderCursor);
        };
        requestAnimationFrame(renderCursor);

        document.querySelectorAll('a, button, input, select, textarea, .service-card, .service-slide-card, .case-card, .team-slide-card, .team-nav-arrow').forEach((el) => {
          el.addEventListener('mouseenter', () => cursorRing.classList.add('active'));
          el.addEventListener('mouseleave', () => cursorRing.classList.remove('active'));
        });
      }

      /* --------------------------------------------------------------------
         9. SERVICES CAROUSEL SLIDER (INFINITE LOOP & ARROW CONTROLS)
         -------------------------------------------------------------------- */
      const servicesSliderWrapper = document.getElementById('servicesSliderWrapper');
      const servicesTrack = document.getElementById('servicesTrack');
      const servicesViewport = document.getElementById('servicesViewport');
      const servicesPrevBtn = document.getElementById('servicesPrevBtn');
      const servicesNextBtn = document.getElementById('servicesNextBtn');
      const servicesDots = document.querySelectorAll('#servicesDots .slider-dot');
      const serviceTabBtns = document.querySelectorAll('[data-service-filter]');

      if (servicesTrack && servicesViewport && servicesPrevBtn && servicesNextBtn) {
        const originalCards = Array.from(servicesTrack.children);
        const totalOriginal = originalCards.length; // 3

        // Prepend and append clones for seamless infinite looping in both directions
        originalCards.forEach((card) => {
          const clonePre = card.cloneNode(true);
          clonePre.classList.add('is-clone');
          servicesTrack.insertBefore(clonePre, servicesTrack.firstChild);
        });
        originalCards.forEach((card) => {
          const clonePost = card.cloneNode(true);
          clonePost.classList.add('is-clone');
          servicesTrack.appendChild(clonePost);
        });

        const allCards = Array.from(servicesTrack.children);
        let currentIndex = totalOriginal; // Start at index 3 (first original slide)
        let isTransitioning = false;
        let autoLoopTimer = null;

        const getStepWidth = () => {
          const card = allCards[0];
          if (!card) return 0;
          const cardRect = card.getBoundingClientRect();
          const gap = parseFloat(window.getComputedStyle(servicesTrack).gap) || 28;
          return cardRect.width + gap;
        };

        const updateDots = (index) => {
          const normalized = ((index - totalOriginal) % totalOriginal + totalOriginal) % totalOriginal;
          servicesDots.forEach((dot, idx) => {
            const isActive = idx === normalized;
            dot.classList.toggle('active', isActive);
            dot.setAttribute('aria-selected', String(isActive));
          });

          serviceTabBtns.forEach((btn) => {
            const filter = btn.getAttribute('data-service-filter');
            const map = { business: 0, legal: 1, hr: 2 };
            const isActive = map[filter] === normalized || (filter === 'all' && normalized === 0);
            btn.classList.toggle('active', isActive);
          });
        };

        const goToSlide = (targetIndex, animate = true) => {
          if (isTransitioning && animate) return;
          if (animate) {
            isTransitioning = true;
            servicesTrack.style.transition = 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
          } else {
            servicesTrack.style.transition = 'none';
          }

          currentIndex = targetIndex;
          const step = getStepWidth();
          servicesTrack.style.transform = `translateX(-${currentIndex * step}px)`;
          updateDots(currentIndex);

          if (!animate) {
            isTransitioning = false;
          }
        };

        servicesTrack.addEventListener('transitionend', () => {
          isTransitioning = false;
          // Silent wrap for infinite seamless loop
          if (currentIndex >= totalOriginal * 2) {
            goToSlide(currentIndex - totalOriginal, false);
          } else if (currentIndex < totalOriginal) {
            goToSlide(currentIndex + totalOriginal, false);
          }
        });

        // Left & Right click
        servicesPrevBtn.addEventListener('click', () => {
          goToSlide(currentIndex - 1, true);
          restartAutoLoop();
        });

        servicesNextBtn.addEventListener('click', () => {
          goToSlide(currentIndex + 1, true);
          restartAutoLoop();
        });

        // Pagination dots
        servicesDots.forEach((dot, idx) => {
          dot.addEventListener('click', () => {
            goToSlide(totalOriginal + idx, true);
            restartAutoLoop();
          });
        });

        // Auto-scroll loop timer
        const startAutoLoop = () => {
          stopAutoLoop();
          autoLoopTimer = setInterval(() => {
            goToSlide(currentIndex + 1, true);
          }, 4000);
        };

        const stopAutoLoop = () => {
          if (autoLoopTimer) {
            clearInterval(autoLoopTimer);
            autoLoopTimer = null;
          }
        };

        const restartAutoLoop = () => {
          stopAutoLoop();
          startAutoLoop();
        };

        // Pause on hover
        servicesSliderWrapper.addEventListener('mouseenter', stopAutoLoop);
        servicesSliderWrapper.addEventListener('mouseleave', startAutoLoop);

        // Resize repositioning
        window.addEventListener('resize', () => {
          goToSlide(currentIndex, false);
        });

        // Mouse Wheel Horizontal/Vertical Scroll Loop Interaction
        let wheelThrottle = false;
        servicesViewport.addEventListener('wheel', (e) => {
          const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
          if (Math.abs(delta) > 20) {
            e.preventDefault();
            if (!wheelThrottle) {
              wheelThrottle = true;
              if (delta > 0) {
                goToSlide(currentIndex + 1, true);
              } else {
                goToSlide(currentIndex - 1, true);
              }
              restartAutoLoop();
              setTimeout(() => { wheelThrottle = false; }, 350);
            }
          }
        }, { passive: false });

        // Touch & Drag Support
        let startX = 0;
        let dragDistance = 0;
        let isDragging = false;

        const handleDragStart = (x) => {
          isDragging = true;
          startX = x;
          dragDistance = 0;
          stopAutoLoop();
        };

        const handleDragMove = (x) => {
          if (!isDragging) return;
          dragDistance = x - startX;
        };

        const handleDragEnd = () => {
          if (!isDragging) return;
          isDragging = false;
          if (dragDistance < -45) {
            goToSlide(currentIndex + 1, true);
          } else if (dragDistance > 45) {
            goToSlide(currentIndex - 1, true);
          } else {
            goToSlide(currentIndex, true);
          }
          startAutoLoop();
        };

        servicesViewport.addEventListener('touchstart', (e) => handleDragStart(e.touches[0].clientX), { passive: true });
        servicesViewport.addEventListener('touchmove', (e) => handleDragMove(e.touches[0].clientX), { passive: true });
        servicesViewport.addEventListener('touchend', handleDragEnd);

        servicesViewport.addEventListener('mousedown', (e) => handleDragStart(e.clientX));
        window.addEventListener('mousemove', (e) => { if (isDragging) handleDragMove(e.clientX); });
        window.addEventListener('mouseup', () => { if (isDragging) handleDragEnd(); });

        // Card Click opens Service Detail Modal
        servicesTrack.addEventListener('click', (e) => {
          if (Math.abs(dragDistance) > 10) return;
          const card = e.target.closest('[data-service-detail]');
          if (card) {
            const detailKey = card.getAttribute('data-service-detail');
            if (typeof serviceDetailsData !== 'undefined' && serviceDetailsData[detailKey] && detailModalContent) {
              const item = serviceDetailsData[detailKey];
              detailModalContent.innerHTML = `
                <span class="eyebrow">${escapeHtml(item.badge)}</span>
                <h2 id="detailModalTitle" style="font-family:var(--font-serif); font-size:1.75rem; margin-bottom:0.75rem;">${escapeHtml(item.title)}</h2>
                <p style="font-size:0.95rem; color:var(--text-secondary); margin-bottom:1.25rem;">${escapeHtml(item.overview)}</p>
                <h4 style="font-size:0.86rem; text-transform:uppercase; letter-spacing:0.1em; color:var(--gold-500); margin-bottom:0.65rem;">Key Engagement Deliverables</h4>
                <ul class="service-list" style="margin-bottom:1.5rem;">
                  ${item.deliverables.map((d) => `<li>${escapeHtml(d)}</li>`).join('')}
                </ul>
                <button class="btn btn-gold" id="modalBookPractice">Schedule Practice Consultation</button>
              `;
              openModal(detailModal);
              const modalBookBtn = document.getElementById('modalBookPractice');
              if (modalBookBtn) {
                modalBookBtn.addEventListener('click', () => {
                  closeAllModals();
                  openModal(consultationModal);
                });
              }
            }
          }
        });

        // Mega Menu practice links
        const servicePracticeMap = { business: 0, legal: 1, hr: 2 };
        document.querySelectorAll('[data-select-service]').forEach((link) => {
          link.addEventListener('click', () => {
            const practice = link.getAttribute('data-select-service');
            if (servicePracticeMap[practice] !== undefined) {
              goToSlide(totalOriginal + servicePracticeMap[practice], true);
              restartAutoLoop();
            }
          });
        });

        // Filter tabs click (if tabs exist/unhidden)
        serviceTabBtns.forEach((btn) => {
          btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-service-filter');
            if (servicePracticeMap[filter] !== undefined) {
              goToSlide(totalOriginal + servicePracticeMap[filter], true);
            } else {
              goToSlide(totalOriginal, true);
            }
            restartAutoLoop();
          });
        });

        // Initial setup
        setTimeout(() => {
          goToSlide(totalOriginal, false);
          startAutoLoop();
        }, 80);
      }

      /* --------------------------------------------------------------------
         9B. INDUSTRIES SLIDER (1-5 AND 6-10 WITH ARROWS)
         -------------------------------------------------------------------- */
      const industriesTrack = document.getElementById('industriesTrack');
      const industriesViewport = document.getElementById('industriesViewport');
      const industriesPrevBtn = document.getElementById('industriesPrevBtn');
      const industriesNextBtn = document.getElementById('industriesNextBtn');
      const industriesDots = document.querySelectorAll('#industriesDots .slider-dot');

      if (industriesTrack && industriesPrevBtn && industriesNextBtn) {
        let currentIndSlide = 0;

        const getCardsPerView = () => {
          if (window.innerWidth >= 1140) return 5;
          if (window.innerWidth >= 900) return 3;
          if (window.innerWidth >= 640) return 2;
          return 1;
        };

        const getTotalIndSlides = () => {
          const cardsPerView = getCardsPerView();
          return Math.ceil(10 / cardsPerView);
        };

        const updateIndustriesSlider = (targetIndex) => {
          const totalSlides = getTotalIndSlides();
          currentIndSlide = (targetIndex + totalSlides) % totalSlides;

          const cards = industriesTrack.querySelectorAll('.industry-card');
          const cardsPerView = getCardsPerView();
          const targetCardIndex = Math.min(currentIndSlide * cardsPerView, cards.length - 1);
          const targetCard = cards[targetCardIndex];

          if (targetCard && cards[0]) {
            const offset = targetCard.offsetLeft - cards[0].offsetLeft;
            industriesTrack.style.transform = `translateX(-${offset}px)`;
          }

          industriesDots.forEach((dot, idx) => {
            const isActive = idx === currentIndSlide;
            dot.classList.toggle('active', isActive);
            dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
          });
        };

        industriesPrevBtn.addEventListener('click', () => {
          updateIndustriesSlider(currentIndSlide - 1);
        });

        industriesNextBtn.addEventListener('click', () => {
          updateIndustriesSlider(currentIndSlide + 1);
        });

        industriesDots.forEach((dot) => {
          dot.addEventListener('click', () => {
            const slideIdx = parseInt(dot.getAttribute('data-slide'), 10);
            updateIndustriesSlider(slideIdx);
          });
        });

        // Touch swipe support
        let indTouchStartX = 0;
        if (industriesViewport) {
          industriesViewport.addEventListener('touchstart', (e) => {
            indTouchStartX = e.changedTouches[0].screenX;
          }, { passive: true });

          industriesViewport.addEventListener('touchend', (e) => {
            const diff = e.changedTouches[0].screenX - indTouchStartX;
            if (Math.abs(diff) > 40) {
              updateIndustriesSlider(diff < 0 ? currentIndSlide + 1 : currentIndSlide - 1);
            }
          }, { passive: true });
        }

        window.addEventListener('resize', () => {
          updateIndustriesSlider(currentIndSlide);
        });
      }


      /* --------------------------------------------------------------------
         10. CLIENT TESTIMONIAL CAROUSEL (AUTO-SLIDE + TOUCH/SWIPE)
         -------------------------------------------------------------------- */
      const testimonialTrack = document.getElementById('testimonialTrack');
      const testimonialDots = document.querySelectorAll('#testimonialDots .slider-dot');
      const prevTestimonial = document.getElementById('prevTestimonial');
      const nextTestimonial = document.getElementById('nextTestimonial');
      const testimonialSlider = document.getElementById('testimonialSlider');
      let currentSlide = 0;
      const totalSlides = testimonialDots.length;
      let autoSlideTimer;

      const goToSlide = (index) => {
        currentSlide = (index + totalSlides) % totalSlides;
        testimonialTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
        testimonialDots.forEach((dot, i) => dot.classList.toggle('active', i === currentSlide));
      };

      const startAutoSlide = () => {
        clearInterval(autoSlideTimer);
        autoSlideTimer = setInterval(() => goToSlide(currentSlide + 1), 6000);
      };

      prevTestimonial.addEventListener('click', () => {
        goToSlide(currentSlide - 1);
        startAutoSlide();
      });

      nextTestimonial.addEventListener('click', () => {
        goToSlide(currentSlide + 1);
        startAutoSlide();
      });

      testimonialDots.forEach((dot) => {
        dot.addEventListener('click', () => {
          goToSlide(parseInt(dot.getAttribute('data-slide'), 10));
          startAutoSlide();
        });
      });

      testimonialSlider.addEventListener('mouseenter', () => clearInterval(autoSlideTimer));
      testimonialSlider.addEventListener('mouseleave', startAutoSlide);

      // Touch & Swipe Support
      let touchStartX = 0;
      testimonialSlider.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      testimonialSlider.addEventListener('touchend', (e) => {
        const diff = e.changedTouches[0].screenX - touchStartX;
        if (Math.abs(diff) > 45) {
          goToSlide(diff < 0 ? currentSlide + 1 : currentSlide - 1);
          startAutoSlide();
        }
      }, { passive: true });

      startAutoSlide();

      /* --------------------------------------------------------------------
         10B. LEADERSHIP TEAM CAROUSEL SLIDER (INFINITE LOOP & ARROW CONTROLS)
         -------------------------------------------------------------------- */
      const teamSliderWrapper = document.getElementById('teamSliderWrapper');
      const teamTrack = document.getElementById('teamTrack');
      const teamViewport = document.getElementById('teamViewport');
      const teamPrevBtn = document.getElementById('teamPrevBtn');
      const teamNextBtn = document.getElementById('teamNextBtn');

      if (teamTrack && teamViewport && teamPrevBtn && teamNextBtn) {
        const originalCards = Array.from(teamTrack.children);
        const totalOriginal = originalCards.length; // 6

        // Prepend and append clones for seamless infinite looping in both directions
        // Sequence: [clone0..clone5] + [orig0..orig5] + [clone0..clone5]
        originalCards.forEach((card) => {
          const clonePre = card.cloneNode(true);
          clonePre.classList.add('is-clone');
          teamTrack.insertBefore(clonePre, originalCards[0]);
        });
        originalCards.forEach((card) => {
          const clonePost = card.cloneNode(true);
          clonePost.classList.add('is-clone');
          teamTrack.appendChild(clonePost);
        });

        const allCards = Array.from(teamTrack.children);
        let currentTeamIndex = totalOriginal; // Start at index 6 (Slide 1 Alexander Vance)
        let isTeamTransitioning = false;
        let teamAutoLoopTimer = null;

        const getTeamStepWidth = () => {
          const firstCard = allCards[0];
          if (!firstCard) return 0;
          const cardRect = firstCard.getBoundingClientRect();
          const gap = parseFloat(window.getComputedStyle(teamTrack).gap) || 24;
          return cardRect.width + gap;
        };

        const goToTeamSlide = (targetIndex, animate = true) => {
          if (isTeamTransitioning && animate) return;
          if (animate) {
            isTeamTransitioning = true;
            teamTrack.style.transition = 'transform 0.65s cubic-bezier(0.22, 1, 0.36, 1)';
          } else {
            teamTrack.style.transition = 'none';
          }

          currentTeamIndex = targetIndex;
          const step = getTeamStepWidth();
          teamTrack.style.transform = `translateX(-${currentTeamIndex * step}px)`;

          if (!animate) {
            isTeamTransitioning = false;
          }
        };

        teamTrack.addEventListener('transitionend', () => {
          isTeamTransitioning = false;
          // Seamless silent reset when crossing boundaries
          if (currentTeamIndex >= totalOriginal * 2) {
            goToTeamSlide(currentTeamIndex - totalOriginal, false);
          } else if (currentTeamIndex < totalOriginal) {
            goToTeamSlide(currentTeamIndex + totalOriginal, false);
          }
        });

        // Left & Right arrow controls
        teamPrevBtn.addEventListener('click', () => {
          goToTeamSlide(currentTeamIndex - 1, true);
          restartTeamAutoLoop();
        });

        teamNextBtn.addEventListener('click', () => {
          goToTeamSlide(currentTeamIndex + 1, true);
          restartTeamAutoLoop();
        });

        // Auto-scroll continuous loop timer
        const startTeamAutoLoop = () => {
          stopTeamAutoLoop();
          teamAutoLoopTimer = setInterval(() => {
            goToTeamSlide(currentTeamIndex + 1, true);
          }, 3800);
        };

        const stopTeamAutoLoop = () => {
          if (teamAutoLoopTimer) {
            clearInterval(teamAutoLoopTimer);
            teamAutoLoopTimer = null;
          }
        };

        const restartTeamAutoLoop = () => {
          stopTeamAutoLoop();
          startTeamAutoLoop();
        };

        // Pause auto-scroll on hover
        if (teamSliderWrapper) {
          teamSliderWrapper.addEventListener('mouseenter', stopTeamAutoLoop);
          teamSliderWrapper.addEventListener('mouseleave', startTeamAutoLoop);
        }

        // Window resize repositioning
        window.addEventListener('resize', () => {
          goToTeamSlide(currentTeamIndex, false);
        });

        // Mouse Wheel Scroll Loop Interaction
        let teamWheelThrottle = false;
        teamViewport.addEventListener('wheel', (e) => {
          const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
          if (Math.abs(delta) > 20) {
            e.preventDefault();
            if (!teamWheelThrottle) {
              teamWheelThrottle = true;
              if (delta > 0) {
                goToTeamSlide(currentTeamIndex + 1, true);
              } else {
                goToTeamSlide(currentTeamIndex - 1, true);
              }
              restartTeamAutoLoop();
              setTimeout(() => { teamWheelThrottle = false; }, 350);
            }
          }
        }, { passive: false });

        // Touch & Drag Support
        let teamStartX = 0;
        let teamDragDist = 0;
        let isTeamDragging = false;

        const handleTeamDragStart = (x) => {
          isTeamDragging = true;
          teamStartX = x;
          teamDragDist = 0;
          stopTeamAutoLoop();
        };

        const handleTeamDragMove = (x) => {
          if (!isTeamDragging) return;
          teamDragDist = x - teamStartX;
        };

        const handleTeamDragEnd = () => {
          if (!isTeamDragging) return;
          isTeamDragging = false;
          if (teamDragDist < -45) {
            goToTeamSlide(currentTeamIndex + 1, true);
          } else if (teamDragDist > 45) {
            goToTeamSlide(currentTeamIndex - 1, true);
          } else {
            goToTeamSlide(currentTeamIndex, true);
          }
          startTeamAutoLoop();
        };

        teamViewport.addEventListener('touchstart', (e) => handleTeamDragStart(e.touches[0].clientX), { passive: true });
        teamViewport.addEventListener('touchmove', (e) => handleTeamDragMove(e.touches[0].clientX), { passive: true });
        teamViewport.addEventListener('touchend', handleTeamDragEnd);

        teamViewport.addEventListener('mousedown', (e) => handleTeamDragStart(e.clientX));
        window.addEventListener('mousemove', (e) => { if (isTeamDragging) handleTeamDragMove(e.clientX); });
        window.addEventListener('mouseup', () => { if (isTeamDragging) handleTeamDragEnd(); });

        // Card & Badge Click Interaction
        teamTrack.addEventListener('click', (e) => {
          if (Math.abs(teamDragDist) > 10) return;
          const badgeBtn = e.target.closest('.team-card-badge-btn');
          const card = e.target.closest('.team-slide-card');
          if (badgeBtn || card) {
            const consultationModal = document.getElementById('consultationModal');
            if (consultationModal && typeof openModal === 'function') {
              openModal(consultationModal);
            } else {
              const contactSection = document.getElementById('contact');
              if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
              }
            }
          }
        });

        // Initial alignment and loop initiation
        setTimeout(() => {
          goToTeamSlide(totalOriginal, false);
          startTeamAutoLoop();
        }, 120);

        window.addEventListener('load', () => {
          goToTeamSlide(currentTeamIndex, false);
        });
      }

      /* --------------------------------------------------------------------
         11. CASE STUDY CATEGORY FILTERING
         -------------------------------------------------------------------- */
      const caseFilterBtns = document.querySelectorAll('[data-case-filter]');
      const caseCards = document.querySelectorAll('[data-case-category]');

      caseFilterBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          const filter = btn.getAttribute('data-case-filter');
          caseFilterBtns.forEach((b) => b.classList.toggle('active', b === btn));
          caseCards.forEach((card) => {
            const match = filter === 'all' || card.getAttribute('data-case-category') === filter;
            card.style.display = match ? 'flex' : 'none';
          });
        });
      });

      /* --------------------------------------------------------------------
         12. INSIGHTS CATEGORY FILTERING & LIVE SEARCH
         -------------------------------------------------------------------- */
      const articleFilterBtns = document.querySelectorAll('[data-article-filter]');
      const articleCards = document.querySelectorAll('[data-article-cat]');
      const articleSearchInput = document.getElementById('articleSearchInput');
      const noArticlesMsg = document.getElementById('noArticlesMsg');
      let activeArticleCategory = 'all';

      const filterArticles = () => {
        const query = articleSearchInput.value.trim().toLowerCase();
        let visibleCount = 0;

        articleCards.forEach((card) => {
          const cat = card.getAttribute('data-article-cat');
          const text = card.textContent.toLowerCase();
          const catMatch = activeArticleCategory === 'all' || cat === activeArticleCategory;
          const queryMatch = !query || text.includes(query);
          const show = catMatch && queryMatch;
          card.style.display = show ? 'flex' : 'none';
          if (show) visibleCount++;
        });

        noArticlesMsg.style.display = visibleCount === 0 ? 'block' : 'none';
      };

      articleFilterBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          activeArticleCategory = btn.getAttribute('data-article-filter');
          articleFilterBtns.forEach((b) => b.classList.toggle('active', b === btn));
          filterArticles();
        });
      });

      articleSearchInput.addEventListener('input', filterArticles);

      /* --------------------------------------------------------------------
         13. FAQ ACCORDION (SINGLE OPEN AT A TIME)
         -------------------------------------------------------------------- */
      const faqItems = document.querySelectorAll('.faq-item');

      faqItems.forEach((item) => {
        const btn = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        if (btn && answer) {
          btn.addEventListener('click', () => {
            const isOpen = item.classList.contains('open');

            faqItems.forEach((other) => {
              other.classList.remove('open');
              const otherBtn = other.querySelector('.faq-question');
              const otherAns = other.querySelector('.faq-answer');
              if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
              if (otherAns) otherAns.style.maxHeight = null;
            });

            if (!isOpen) {
              item.classList.add('open');
              btn.setAttribute('aria-expanded', 'true');
              answer.style.maxHeight = `${answer.scrollHeight}px`;
            }
          });
        }
      });

      // Initialize height for default open card (Card 01)
      const initialOpenFaq = document.querySelector('.faq-item.open .faq-answer');
      if (initialOpenFaq) {
        initialOpenFaq.style.maxHeight = `${initialOpenFaq.scrollHeight}px`;
      }

      /* --------------------------------------------------------------------
         14. MODALS (CONSULTATION MODAL & RICH DETAIL MODAL)
         -------------------------------------------------------------------- */
      const consultationModal = document.getElementById('consultationModal');
      const closeConsultModal = document.getElementById('closeConsultModal');
      const detailModal = document.getElementById('detailModal');
      const closeDetailModal = document.getElementById('closeDetailModal');
      const detailModalContent = document.getElementById('detailModalContent');

      const openModal = (modalEl) => {
        modalEl.classList.add('open');
        document.body.style.overflow = 'hidden';
      };

      const closeAllModals = () => {
        consultationModal.classList.remove('open');
        detailModal.classList.remove('open');
        document.body.style.overflow = '';
      };

      document.querySelectorAll('[data-open-consultation]').forEach((btn) => {
        btn.addEventListener('click', () => {
          toggleMobileMenu(false);
          openModal(consultationModal);
        });
      });

      closeConsultModal.addEventListener('click', closeAllModals);
      closeDetailModal.addEventListener('click', closeAllModals);

      [consultationModal, detailModal].forEach((backdrop) => {
        backdrop.addEventListener('click', (e) => {
          if (e.target === backdrop) closeAllModals();
        });
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          closeAllModals();
          toggleMobileMenu(false);
        }
      });

      // Data Stores for Modals
      const caseStudiesData = [
        {
          industry: 'Manufacturing â€¢ Business Consulting (Illustrative Case Study)',
          title: 'Post-Merger Operational Turnaround & Margin Expansion',
          challenge: 'Following a cross-border acquisition, a mid-cap industrial manufacturer faced duplicated regional supply chains, declining EBITDA margins, and fragmented ERP reporting across four production facilities.',
          approach: 'Vanguard & Sterling deployed a joint Strategy and Financial Advisory team to consolidate procurement contracts, redesign plant-floor KPI governance, and implement zero-based budgeting.',
          outcome: 'Within nine months, the client achieved +34% EBITDA margin expansion, $18.5M in annualized run-rate savings, and unified board-level financial visibility.'
        },
        {
          industry: 'Banking & FinTech â€¢ Legal Services (Illustrative Case Study)',
          title: 'Multi-Jurisdiction Regulatory Licensing & IP Architecture',
          challenge: 'A rapidly scaling B2B payments platform required regulatory authorization, cross-border commercial agreements, and core algorithmic IP protection across six jurisdictions.',
          approach: 'Our Corporate Legal Advisors structured an IP holding subsidiary, drafted standardized enterprise SaaS MSAs, and led regulatory compliance filings with local financial authorities.',
          outcome: '100% first-pass regulatory audit approval and a 4.5-month acceleration in commercial market launch across target territories.'
        },
        {
          industry: 'Healthcare & Medical â€¢ HR Consulting (Illustrative Case Study)',
          title: 'Enterprise Leadership Academy & Retention Transformation',
          challenge: 'A 2,400-employee multi-specialty healthcare network experienced 26% annual attrition among senior clinical directors and lacked structured succession pathways.',
          approach: 'Our HR Consultants benchmarked total rewards against top-quartile peers, launched a clinical leadership fellowship, and instituted transparent bi-annual performance calibration.',
          outcome: 'Senior attrition dropped by 41% within two quarters, while internal leadership bench readiness rose to 92%.'
        }
      ];

      const serviceDetailsData = {
        business: {
          badge: 'Practice 01 â€¢ Business Consulting',
          title: 'Strategic & Operational Business Consulting',
          overview: 'We partner with CEOs, founders, and boards to solve complex growth, profitability, and transformation challenges with analytical rigor.',
          deliverables: ['5-Year Corporate Growth & Market Entry Blueprints', 'M&A Commercial Due Diligence & Post-Merger Integration', 'Financial Modeling, Working Capital & Margin Optimization', 'Enterprise Risk Management & Digital Operating Models']
        },
        legal: {
          badge: 'Practice 02 â€¢ Legal Services',
          title: 'Corporate Legal & Regulatory Advisory',
          overview: 'Proactive commercial counsel designed to protect enterprise assets, streamline transactions, and ensure continuous statutory compliance.',
          deliverables: ['Entity Incorporation, Shareholder & Joint-Venture Agreements', 'Commercial Contract Drafting, Negotiation & Lifecycle Audits', 'Employment Law Governance & Executive Severance Advisory', 'Trademark, Patent & Proprietary IP Portfolio Protection']
        },
        hr: {
          badge: 'Practice 03 â€¢ HR Consulting',
          title: 'Strategic Human Capital & Organizational Consulting',
          overview: 'Aligning talent strategy with business ambition to attract high-caliber leaders, elevate engagement, and future-proof your workforce.',
          deliverables: ['Executive Search & High-Volume Talent Acquisition Frameworks', 'Compensation Benchmarking, Bonus & ESOP Architecture', 'Performance Management & Leadership Competency Academies', 'Organizational Design & Change Management Programs']
        }
      };

      const articlesData = [
        {
          cat: 'Business Strategy & Growth',
          date: 'October 18, 2026',
          title: 'Capital Allocation & Resilient Growth in Volatile Markets',
          body: 'In periods of shifting interest rates and supply chain realignment, outperforming enterprises avoid across-the-board retrenchment. Instead, top-quartile leadership teams ring-fence core cash-generating units while reallocating 15â€“20% of capital expenditure toward high-margin digital automation and strategic bolt-on acquisitions.'
        },
        {
          cat: 'Corporate Legal Compliance',
          date: 'October 04, 2026',
          title: 'Cross-Border Data Governance & AI Contracting Standards',
          body: 'As enterprise software vendors embed generative AI into mission-critical workflows, corporate legal teams must update Master Services Agreements to address training-data isolation, intellectual property indemnification, and cross-border data residency compliance.'
        },
        {
          cat: 'Human Resource Management',
          date: 'September 21, 2026',
          title: 'Total Rewards Architecture for High-Retention Organizations',
          body: 'Competitive base salary alone no longer secures scarce leadership talent. High-retention organizations combine transparent career architecture, performance-linked equity or profit participation, and targeted executive coaching to sustain long-term engagement.'
        },
        {
          cat: 'Leadership & Org Development',
          date: 'September 09, 2026',
          title: 'Building Agile C-Suite Alignment During Digital Transformation',
          body: 'Over 60% of enterprise transformation programs stall due to misaligned incentives between Finance, Legal, IT, and Operations. Establishing a unified Transformation Management Office with shared quarterly milestones ensures rapid, compliant execution.'
        }
      ];

      const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      })[character]);
      const cmsRows = (key) => Array.isArray(window.siteCmsContent?.[key])
        ? window.siteCmsContent[key].filter((row) => row && typeof row === 'object')
        : [];
      const cmsText = (row, key) => typeof row[key] === 'string' ? row[key] : '';

      const cmsCases = cmsRows('case_studies');
      if (cmsCases.length) {
        caseStudiesData.splice(0, caseStudiesData.length, ...cmsCases.map((row) => ({
          industry: cmsText(row, 'industry'),
          title: cmsText(row, 'title'),
          challenge: cmsText(row, 'challenge'),
          approach: cmsText(row, 'approach'),
          outcome: cmsText(row, 'outcome')
        })));
      }

      const cmsServices = cmsRows('services');
      if (cmsServices.length) {
        Object.keys(serviceDetailsData).forEach((key) => delete serviceDetailsData[key]);
        cmsServices.forEach((row) => {
          const details = row.details && typeof row.details === 'object' ? row.details : {};
          serviceDetailsData[cmsText(row, 'slug')] = {
            badge: typeof details.badge === 'string' ? details.badge : cmsText(row, 'category'),
            title: typeof details.title === 'string' ? details.title : cmsText(row, 'title'),
            overview: typeof details.overview === 'string' ? details.overview : cmsText(row, 'summary'),
            deliverables: Array.isArray(details.deliverables)
              ? details.deliverables.filter((item) => typeof item === 'string')
              : []
          };
        });
      }

      const cmsArticles = cmsRows('articles');
      if (cmsArticles.length) {
        articlesData.splice(0, articlesData.length, ...cmsArticles.map((row) => ({
          cat: cmsText(row, 'category'),
          date: cmsText(row, 'published_at'),
          title: cmsText(row, 'title'),
          body: cmsText(row, 'body')
        })));
      }

      document.querySelectorAll('[data-open-case]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const item = caseStudiesData[parseInt(btn.getAttribute('data-open-case'), 10)];
          if (!item) return;
          detailModalContent.innerHTML = `
            <span class="eyebrow">${escapeHtml(item.industry)}</span>
            <h2 id="detailModalTitle" style="font-family:var(--font-serif); font-size:1.75rem; margin-bottom:1.25rem;">${escapeHtml(item.title)}</h2>
            <div style="display:grid; gap:1rem; font-size:0.94rem; color:var(--text-secondary);">
              <div style="padding:1rem; background:var(--bg-primary); border-radius:10px; border-left:3px solid var(--gold-500);">
                <strong style="color:var(--text-primary); display:block; margin-bottom:0.25rem;">The Challenge</strong>
                ${escapeHtml(item.challenge)}
              </div>
              <div style="padding:1rem; background:var(--bg-primary); border-radius:10px; border-left:3px solid var(--gold-500);">
                <strong style="color:var(--text-primary); display:block; margin-bottom:0.25rem;">Our Approach</strong>
                ${escapeHtml(item.approach)}
              </div>
              <div style="padding:1rem; background:var(--bg-primary); border-radius:10px; border-left:3px solid var(--gold-500);">
                <strong style="color:var(--text-primary); display:block; margin-bottom:0.25rem;">Measured Outcome</strong>
                ${escapeHtml(item.outcome)}
              </div>
            </div>
            <div style="margin-top:1.5rem; display:flex; justify-content:flex-end;">
              <button class="btn btn-gold" id="modalDiscussCase">Discuss a Similar Mandate</button>
            </div>
          `;
          openModal(detailModal);
          document.getElementById('modalDiscussCase').addEventListener('click', () => {
            closeAllModals();
            openModal(consultationModal);
          });
        });
      });

      document.querySelectorAll('[data-service-detail]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const item = serviceDetailsData[btn.getAttribute('data-service-detail')];
          if (!item) return;
          detailModalContent.innerHTML = `
            <span class="eyebrow">${escapeHtml(item.badge)}</span>
            <h2 id="detailModalTitle" style="font-family:var(--font-serif); font-size:1.75rem; margin-bottom:0.75rem;">${escapeHtml(item.title)}</h2>
            <p style="font-size:0.95rem; color:var(--text-secondary); margin-bottom:1.25rem;">${escapeHtml(item.overview)}</p>
            <h4 style="font-size:0.86rem; text-transform:uppercase; letter-spacing:0.1em; color:var(--gold-500); margin-bottom:0.65rem;">Key Engagement Deliverables</h4>
            <ul class="service-list" style="margin-bottom:1.5rem;">
              ${item.deliverables.map((d) => `<li>${escapeHtml(d)}</li>`).join('')}
            </ul>
            <button class="btn btn-gold" id="modalBookPractice">Schedule Practice Consultation</button>
          `;
          openModal(detailModal);
          document.getElementById('modalBookPractice').addEventListener('click', () => {
            closeAllModals();
            openModal(consultationModal);
          });
        });
      });

      document.querySelectorAll('[data-open-article]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const art = articlesData[parseInt(btn.getAttribute('data-open-article'), 10)];
          if (!art) return;
          detailModalContent.innerHTML = `
            <span class="eyebrow">${escapeHtml(art.cat)}</span>
            <h2 id="detailModalTitle" style="font-family:var(--font-serif); font-size:1.75rem; margin-bottom:0.4rem;">${escapeHtml(art.title)}</h2>
            <p style="font-size:0.82rem; color:var(--text-muted); margin-bottom:1.25rem;">Published ${escapeHtml(art.date)} &bull; Vanguard &amp; Sterling Editorial Desk</p>
            <p style="font-size:0.98rem; line-height:1.75; color:var(--text-secondary); margin-bottom:1.5rem;">${escapeHtml(art.body)}</p>
            <button class="btn btn-outline-navy" id="modalArticleConsult">Request Full Advisory Briefing</button>
          `;
          openModal(detailModal);
          document.getElementById('modalArticleConsult').addEventListener('click', () => {
            closeAllModals();
            openModal(consultationModal);
          });
        });
      });

      document.querySelectorAll('[data-open-legal]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const isPrivacy = btn.getAttribute('data-open-legal') === 'privacy';
          const title = btn.dataset.legalTitle || (isPrivacy
            ? 'Privacy & Data Protection Policy'
            : 'Terms & Conditions of Use');
          const body = btn.dataset.legalBody || (isPrivacy
            ? 'Vanguard & Sterling Advisory respects your corporate and personal privacy. Information submitted via our consultation or enquiry interfaces is processed strictly for client engagement evaluation under ISO 27001-aligned confidentiality controls and is never sold or shared with unauthorized third parties.'
            : 'Materials published on this corporate website are provided for general executive information and do not constitute formal legal, financial, or tax advice until a formal Letter of Engagement is executed with Vanguard & Sterling Advisory.');
          detailModalContent.innerHTML = `
            <span class="eyebrow">Corporate Governance</span>
            <h2 id="detailModalTitle" style="font-family:var(--font-serif); font-size:1.75rem; margin-bottom:0.85rem;">
              ${escapeHtml(title)}
            </h2>
            <p style="font-size:0.92rem; color:var(--text-secondary); line-height:1.7;">
              ${escapeHtml(body)}
            </p>
          `;
          openModal(detailModal);
        });
      });

      /* --------------------------------------------------------------------
         15. FORM VALIDATIONS (CONTACT, CONSULTATION & NEWSLETTER)
         -------------------------------------------------------------------- */
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      const phoneRegex = /^[+]?[\d\s().-]{7,20}$/;

      // Contact Form
      const contactForm = document.getElementById('contactForm');
      const contactSubmitBtn = document.getElementById('contactSubmitBtn');
      const contactFeedback = document.getElementById('contactFeedback');

      const setFieldError = (id, message) => {
        const input = document.getElementById(id);
        const errEl = document.getElementById(`err-${id}`);
        if (input) input.classList.toggle('invalid', Boolean(message));
        if (errEl) errEl.textContent = message;
      };

      contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        contactFeedback.className = 'form-feedback';
        contactFeedback.textContent = '';

        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('businessEmail').value.trim();
        const phone = document.getElementById('phoneNumber').value.trim();
        const company = document.getElementById('companyName').value.trim();
        const service = document.getElementById('selectService').value.trim();
        const subject = document.getElementById('subject').value.trim();
        const message = document.getElementById('message').value.trim();

        let valid = true;

        if (fullName.length < 2) { setFieldError('fullName', 'Please enter your full name.'); valid = false; } else setFieldError('fullName', '');
        if (!emailRegex.test(email)) { setFieldError('businessEmail', 'Please enter a valid business email address.'); valid = false; } else setFieldError('businessEmail', '');
        if (!phoneRegex.test(phone)) { setFieldError('phoneNumber', 'Please enter a valid contact phone number.'); valid = false; } else setFieldError('phoneNumber', '');
        if (company.length < 2) { setFieldError('companyName', 'Please enter your company or organization name.'); valid = false; } else setFieldError('companyName', '');
        if (!service) { setFieldError('selectService', 'Please select a consulting practice.'); valid = false; } else setFieldError('selectService', '');
        if (subject.length < 3) { setFieldError('subject', 'Please provide an enquiry subject.'); valid = false; } else setFieldError('subject', '');
        if (message.length < 12) { setFieldError('message', 'Please include at least 12 characters describing your enquiry.'); valid = false; } else setFieldError('message', '');

        if (!valid) return;

        contactSubmitBtn.disabled = true;
        contactSubmitBtn.textContent = 'Submitting Enquiry...';

        try {
          const response = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              kind: 'contact',
              fullName,
              email,
              phone,
              company,
              service,
              subject,
              message
            })
          });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error || 'Your enquiry could not be submitted.');
          contactForm.reset();
          contactFeedback.className = 'form-feedback success';
          contactFeedback.textContent = `Thank you, ${fullName}. Your ${service} enquiry for ${company} has been sent to our advisory team.`;
        } catch (error) {
          contactFeedback.className = 'form-feedback error';
          contactFeedback.textContent = error instanceof Error ? error.message : 'Your enquiry could not be submitted. Please try again.';
        } finally {
          contactSubmitBtn.disabled = false;
          contactSubmitBtn.textContent = 'Submit Enquiry';
        }
      });

      // Consultation Modal Form
      const consultationForm = document.getElementById('consultationForm');
      const modalFeedback = document.getElementById('modalFeedback');
      const modalDateInput = document.getElementById('modalDate');
      modalDateInput.min = new Date().toISOString().split('T')[0];

      consultationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const mName = document.getElementById('modalName').value.trim();
        const mEmail = document.getElementById('modalEmail').value.trim();
        const mService = document.getElementById('modalService').value;
        const mDate = modalDateInput.value;

        let ok = true;
        if (mName.length < 2) { setFieldError('modalName', 'Full name is required.'); ok = false; } else setFieldError('modalName', '');
        if (!emailRegex.test(mEmail)) { setFieldError('modalEmail', 'Valid work email is required.'); ok = false; } else setFieldError('modalEmail', '');
        if (!mDate) { setFieldError('modalDate', 'Please select a preferred date.'); ok = false; } else setFieldError('modalDate', '');

        if (!ok) return;

        const submitButton = consultationForm.querySelector('button[type="submit"]');
        if (submitButton) {
          submitButton.disabled = true;
          submitButton.textContent = 'Submitting request…';
        }
        try {
          const response = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              kind: 'consultation',
              fullName: mName,
              email: mEmail,
              service: mService,
              preferredDate: mDate,
              notes: document.getElementById('modalNotes').value.trim()
            })
          });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error || 'Your consultation request could not be submitted.');
          modalFeedback.className = 'form-feedback success';
          modalFeedback.textContent = `Thank you, ${mName}. Your ${mService} consultation request for ${mDate} has been sent.`;
          consultationForm.reset();
        } catch (error) {
          modalFeedback.className = 'form-feedback error';
          modalFeedback.textContent = error instanceof Error ? error.message : 'Your request could not be submitted. Please try again.';
        } finally {
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = 'Confirm Consultation Request';
          }
        }
      });

      // Newsletter Form
      const newsletterForm = document.getElementById('newsletterForm');
      const newsletterEmail = document.getElementById('newsletterEmail');
      const newsletterConsent = document.getElementById('newsletterConsent');
      const newsletterError = document.getElementById('newsletterError');
      const newsletterFeedback = document.getElementById('newsletterFeedback');

      if (newsletterForm) newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        newsletterError.textContent = '';
        newsletterFeedback.className = 'form-feedback';

        const val = newsletterEmail.value.trim();
        if (!emailRegex.test(val)) {
          newsletterError.textContent = 'Please enter a valid business email address.';
          return;
        }
        if (!newsletterConsent.checked) {
          newsletterError.textContent = 'Please confirm privacy consent to subscribe.';
          return;
        }

        newsletterFeedback.className = 'form-feedback success';
        newsletterFeedback.textContent = `Subscribed! ${val} has been registered for Vanguard & Sterling Executive Briefings.`;
        newsletterForm.reset();
      });

      /* --------------------------------------------------------------------
         16. COOKIE CONSENT BANNER & DYNAMIC YEAR
         -------------------------------------------------------------------- */
      const cookieBanner = document.getElementById('cookieBanner');
      if (cookieBanner && localStorage.getItem('vs-cookie-choice')) {
        cookieBanner.classList.add('hidden');
      }

      const dismissCookie = (choice) => {
        localStorage.setItem('vs-cookie-choice', choice);
        cookieBanner?.classList.add('hidden');
      };

      document.getElementById('acceptCookies')?.addEventListener('click', () => dismissCookie('accepted'));
      document.getElementById('declineCookies')?.addEventListener('click', () => dismissCookie('essential'));
      document.getElementById('currentYear').textContent = new Date().getFullYear();
    };

    let interactionsInitialized = false;
    window.initializeLegacyInteractions = () => {
      if (interactionsInitialized) return;
      interactionsInitialized = true;
      initApp();
    };
  
