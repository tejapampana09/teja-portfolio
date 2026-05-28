const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

// Register GSAP plugins globally and inject event normalization configuration
if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    
    // Prevent resizing flashes on mobile browsers when address bars hide/show
    ScrollTrigger.config({ ignoreMobileResize: true });
}

const navToggle = document.getElementById("nav-toggle")
const navMenu = document.getElementById("nav-menu")
const navLinks = document.querySelectorAll(".nav__link")
const cursorGlow = document.getElementById("cursor-glow")
const progressBar = document.getElementById("scroll-progress-bar")
let lenisInstance = null

/* LIQUID-SMOOTH INTEGRATED LENIS SCROLL ENGINE */
const initLenis = () => {
    if (prefersReducedMotion || !window.Lenis) return

    // Instantiate Lenis using dedicated parameters optimized for GSAP matching
    lenisInstance = new Lenis({
        duration: 1.2,              // Stop deceleration timeline delay duration
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Clean exponential curve
        smoothWheel: true,          // Smooth wheel scrolling enabled
        wheelMultiplier: 1.0,       // Global platform wheel tracking sensitivity multiplier
        orientation: 'vertical',
        gestureOrientation: 'vertical'
    })

    // Forward scroll execution milestones directly to ScrollTrigger's cache tracker
    lenisInstance.on("scroll", () => {
        ScrollTrigger.update();
    })

    // Bind Lenis animation loops directly onto GSAP's rendering heartbeat tick frame clock
    gsap.ticker.add((time) => {
        lenisInstance.raf(time * 1000);
    })

    // Turn off lag smoothing to prevent frames from micro-stuttering during pin segments
    gsap.ticker.lagSmoothing(0);
}

const initMenu = () => {
    navToggle?.addEventListener("click", () => {
        navMenu.classList.toggle("show")
        document.body.classList.toggle("menu-open")
        const open = navMenu.classList.contains("show")
        navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu")
        navToggle.innerHTML = open ? '<ion-icon name="close-outline"></ion-icon>' : '<ion-icon name="menu-outline"></ion-icon>'
    })
}

const initSmoothLinks = () => {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener("click", (event) => {
            const target = document.querySelector(link.getAttribute("href"))
            if (!target) return

            event.preventDefault()
            navMenu?.classList.remove("show")
            document.body.classList.remove("menu-open")
            if (navToggle) navToggle.innerHTML = '<ion-icon name="menu-outline"></ion-icon>'

            if (lenisInstance) {
                lenisInstance.scrollTo(target, {
                    offset: -80,
                    duration: 1.25,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                })
            } else {
                target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" })
            }
        })
    })
}

const initTextSplit = () => {
    if (prefersReducedMotion || !window.SplitType) return

    document.querySelectorAll(".split-title, .contact__title").forEach((element) => {
        new SplitType(element, { types: "words, chars" })
        gsap.set(element.querySelectorAll(".char"), {
            yPercent: 115,
            opacity: 0,
            rotateX: -80,
            filter: "blur(12px)"
        })
    })

    document.querySelectorAll(".split-line").forEach((element) => {
        new SplitType(element, { types: "words" })
        gsap.set(element.querySelectorAll(".word"), {
            yPercent: 110,
            opacity: 0,
            filter: "blur(8px)"
        })
    })
}

const revealText = (target, trigger = target) => {
    const chars = target.querySelectorAll(".char")
    const words = target.querySelectorAll(".word")

    if (chars.length) {
        return gsap.to(chars, {
            yPercent: 0,
            opacity: 1,
            rotateX: 0,
            filter: "blur(0px)",
            duration: 1,
            stagger: .012,
            ease: "power4.out",
            scrollTrigger: trigger ? {
                trigger,
                start: "top 82%"
            } : null
        })
    }

    if (words.length) {
        return gsap.to(words, {
            yPercent: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: .85,
            stagger: .04,
            ease: "power4.out",
            scrollTrigger: trigger ? {
                trigger,
                start: "top 86%"
            } : null
        })
    }
}

const initLoader = () => {
    if (prefersReducedMotion) {
        document.querySelector(".loader")?.remove()
        return
    }

    const tl = gsap.timeline({
        defaults: { ease: "expo.inOut" },
        onComplete: () => document.querySelector(".loader")?.remove()
    })

    tl.from(".loader__mark span", { y: 20, opacity: 0, duration: .55 })
        .from(".loader__mark strong", { yPercent: 90, opacity: 0, duration: .8 }, "-=.2")
        .to(".loader__mark", { y: -35, opacity: 0, duration: .65 }, "+=.25")
        .to(".loader__panel--a", { yPercent: -100, duration: 1.15 }, "-=.1")
        .to(".loader__panel--b", { yPercent: -100, duration: 1.15 }, "-=1")
        .to(".loader__panel--c", { yPercent: -100, duration: 1.15 }, "-=.95")
        .to(".loader", { autoAlpha: 0, duration: .1 })
        .add(() => revealText(document.querySelector(".hero__title"), null), "-=.55")
        .fromTo(".hero .kicker .word", {
            yPercent: 110,
            opacity: 0,
            filter: "blur(8px)"
        }, {
            yPercent: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: .75,
            stagger: .04,
            ease: "power4.out"
        }, "-=.7")
        .fromTo(".role-loop, .hero__actions, .hero__footer", {
            y: 30,
            opacity: 0,
            filter: "blur(10px)"
        }, {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: .9,
            stagger: .08,
            ease: "power4.out"
        }, "-=.6")
        /* REMOVED CLIP-PATH AND RESET ENTRY VALUE target scale: 1 */
        .fromTo(".portrait__main", {
            scale: 1.08,
            filter: "blur(16px) saturate(.8)"
        }, {
            scale: 1,
            filter: "blur(0px) saturate(1)",
            duration: 1.25,
            ease: "power4.out"
        }, "-=1")
        .fromTo(".portrait__tag", {
            y: 35,
            opacity: 0,
            filter: "blur(10px)"
        }, {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: .85,
            stagger: .08,
            ease: "power4.out"
        }, "-=.7")
}

const initRoleLoop = () => {
    const roles = gsap.utils.toArray(".role-loop span")
    if (!roles.length || prefersReducedMotion) {
        if (roles[0]) gsap.set(roles[0], { opacity: 1, y: 0 })
        return
    }

    const tl = gsap.timeline({ repeat: -1 })
    roles.forEach((role) => {
        tl.to(role, { y: 0, opacity: 1, duration: .55, ease: "power3.out" })
            .to(role, { y: "-110%", opacity: 0, duration: .55, ease: "power3.in" }, "+=1.35")
            .set(role, { y: "110%" })
    })
}

const initScrollProgress = () => {
    if (!progressBar) return
    gsap.to(progressBar, {
        width: "100%",
        ease: "none",
        scrollTrigger: {
            trigger: document.documentElement,
            start: "top top",
            end: "bottom bottom",
            scrub: .25
        }
    })
}

const initHeroScroll = () => {
    if (prefersReducedMotion) return

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "+=140%",
            pin: true,
            scrub: true
        }
    })

    tl.to(".hero__title", { yPercent: -18, scale: .94, opacity: .55, filter: "blur(3px)", ease: "none" }, 0)
        .to(".hero__bg-word", { scale: 1.18, opacity: .09, rotate: 4, ease: "none" }, 0)
        .to(".portrait", {yPercent: -10,rotateY: -10,rotateX: 4,z: 120,scale: 1.04,ease: "none"}, 0)
        .to(".portrait__main", {scale: 1.08, yPercent: -2, ease: "none"}, 0)
        .to(".hero__footer", { y: -60, opacity: 0, ease: "none" }, 0)
        .to(".light--one", { x: 140, y: -60, scale: 1.2, ease: "none" }, 0)
}

const initTextReveals = () => {
    if (prefersReducedMotion) return
    document.querySelectorAll(".section-title, .contact__title").forEach((title) => revealText(title, title))
    document.querySelectorAll(".split-line").forEach((line) => {
        if (!line.closest(".hero")) revealText(line, line)
    })
}

const initStory = () => {
    if (prefersReducedMotion) return

    gsap.utils.toArray(".chapter").forEach((chapter) => {
        gsap.fromTo(chapter, {
            y: 90,
            opacity: .18,
            scale: .94,
            filter: "blur(14px)"
        }, {
            y: 0,
            opacity: 1,
            scale: 1,
            filter: "blur(0px)",
            ease: "power4.out",
            scrollTrigger: {
                trigger: chapter,
                start: "top 82%",
                end: "center 48%",
                scrub: true
            }
        })
    })

    gsap.to(".story__sticky", {
        yPercent: -12,
        ease: "none",
        scrollTrigger: {
            trigger: ".story",
            start: "top bottom",
            end: "bottom top",
            scrub: true
        }
    })
}

const initMarquee = () => {
    if (prefersReducedMotion) return

    document.querySelectorAll(".marquee").forEach((marquee, index) => {
        const track = marquee.querySelector(".marquee__track")
        const distance = track.scrollWidth / 2
        const dir = index % 2 ? distance : -distance
        const duration = index % 2 ? 36 : 32 // slightly slower for a smoother feel

        // create a persistent tween so we can pause/resume on hover
        const tween = gsap.to(track, {
            x: dir,
            duration,
            ease: "none",
            repeat: -1
        })

        // Pause the marquee on hover for readability, resume on leave
        marquee.addEventListener('mouseenter', () => tween.pause())
        marquee.addEventListener('mouseleave', () => tween.play())
    })
}

const initProjects = () => {
    const cases = gsap.utils.toArray(".case")
    const container = document.querySelector(".projects__container")

    if (
        !cases.length ||
        !container ||
        window.innerWidth <= 980 ||
        prefersReducedMotion
    ) return

    gsap.set(cases, {
        zIndex: (i, target, arr) => arr.length - i
    })

    gsap.set(cases.slice(1), {
        yPercent: 100,
        opacity: 0
    })

    const masterTl = gsap.timeline({
        scrollTrigger: {
            trigger: ".projects",
            start: "top top",
            end: () => `+=${window.innerHeight * cases.length}`,
            pin: true,
            pinSpacing: true,
            scrub: 1.15,
            anticipatePin: 1,
            invalidateOnRefresh: true
        }
    })

    cases.forEach((card, index) => {

        const img = card.querySelector(".case__image img")
        const nextCard = cases[index + 1]
        const cardLabel = `card-${index}`

        if (index > 0) {
            masterTl.to(card, {
                yPercent: 0,
                opacity: 1,
                duration: 1,
                ease: "power2.out"
            }, `${cardLabel}-=0.45`)
        }

        if (img) {
            masterTl.fromTo(img, {
                scale: 1,
                yPercent: -4
            }, {
                scale: 1.12,
                yPercent: 4,
                duration: 2,
                ease: "none"
            }, `${cardLabel}-=0.45`)
        }

        if (nextCard) {
            masterTl.to(card, {
                filter: "blur(10px)",
                opacity: 0,
                scale: 0.92,
                yPercent: -12,
                duration: 1,
                ease: "power2.inOut"
            }, `card-${index + 1}-=0.45`)
        }
    })
}

const initProjectHover = () => {
    if (window.innerWidth < 768 || prefersReducedMotion) return

    document.querySelectorAll(".case, .chapter, .credentials__grid article").forEach((element) => {
        element.addEventListener("mousemove", (event) => {
            const rect = element.getBoundingClientRect()
            const x = event.clientX - rect.left
            const y = event.clientY - rect.top
            element.style.setProperty("--mx", `${(x / rect.width) * 100}%`)
            element.style.setProperty("--my", `${(y / rect.height) * 100}%`)
        })
    })

    document.querySelectorAll(".case").forEach((panel) => {
        const image = panel.querySelector(".case__image")
        panel.addEventListener("mousemove", (event) => {
            const rect = panel.getBoundingClientRect()
            const x = event.clientX - rect.left - rect.width / 2
            const y = event.clientY - rect.top - rect.height / 2
            gsap.to(image, {
                x: x * -.025,
                y: y * -.025,
                duration: .85,
                ease: "power3.out"
            })
        })
        panel.addEventListener("mouseleave", () => {
            gsap.to(image, { x: 0, y: 0, duration: .9, ease: "power3.out" })
        })
    })
}

const initActiveNav = () => {
    document.querySelectorAll("main section[id]").forEach((section) => {
        ScrollTrigger.create({
            trigger: section,
            start: "top center",
            end: "bottom center",
            onToggle: (self) => {
                if (!self.isActive) return
                navLinks.forEach((link) => {
                    link.classList.toggle("active", link.getAttribute("href") === `#${section.id}`)
                })
            }
        })
    })
}

const initCursor = () => {
    if (!cursorGlow || window.innerWidth < 768 || prefersReducedMotion) return

    window.addEventListener("mousemove", (event) => {
        gsap.to(cursorGlow, {
            x: event.clientX,
            y: event.clientY,
            duration: .45,
            ease: "power3.out"
        })
    })
}

const initMagnetic = () => {
    if (window.innerWidth < 768 || prefersReducedMotion) return

    document.querySelectorAll(".magnetic").forEach((element) => {
        element.addEventListener("mousemove", (event) => {
            const rect = element.getBoundingClientRect()
            const x = event.clientX - rect.left - rect.width / 2
            const y = event.clientY - rect.top - rect.height / 2
            gsap.to(element, { x: x * .22, y: y * .22, duration: .35, ease: "power3.out" })
        })

        element.addEventListener("mouseleave", () => {
            gsap.to(element, { x: 0, y: 0, duration: .45, ease: "elastic.out(1, .45)" })
        })
    })
}

const initFloating = () => {
    if (prefersReducedMotion) return

    gsap.to(".portrait__tag--one", { y: -12, x: 8, duration: 3.4, repeat: -1, yoyo: true, ease: "sine.inOut" })
    gsap.to(".portrait__tag--two", { y: 14, x: -6, duration: 3.8, repeat: -1, yoyo: true, ease: "sine.inOut" })
    gsap.to(".contact__orb", {
        scale: 1.12,
        rotate: 12,
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
    })
}

const initCanvasField = () => {
    const canvas = document.getElementById("field")
    if (!canvas || window.innerWidth < 768 || prefersReducedMotion) return

    const ctx = canvas.getContext("2d")
    const particles = Array.from({ length: 70 }, () => ({
        x: Math.random(),
        y: Math.random(),
        r: Math.random() * 1.4 + .35,
        s: Math.random() * .18 + .06
    }))

    const resize = () => {
        canvas.width = window.innerWidth * Math.min(window.devicePixelRatio, 2)
        canvas.height = window.innerHeight * Math.min(window.devicePixelRatio, 2)
        canvas.style.width = `${window.innerWidth}px`
        canvas.style.height = `${window.innerHeight}px`
    }

    const draw = () => {
        const dpr = Math.min(window.devicePixelRatio, 2)
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        particles.forEach((particle) => {
            particle.y -= particle.s / 1000
            if (particle.y < 0) particle.y = 1
            ctx.beginPath()
            ctx.fillStyle = "rgba(255,255,255,.28)"
            ctx.arc(particle.x * canvas.width, particle.y * canvas.height, particle.r * dpr, 0, Math.PI * 2)
            ctx.fill()
        })
        requestAnimationFrame(draw)
    }

    resize()
    draw()
    window.addEventListener("resize", resize)
}

window.addEventListener("load", () => {
    initTextSplit()
    initLenis()
    initMenu()
    initSmoothLinks()
    initLoader()
    initRoleLoop()
    initScrollProgress()
    initHeroScroll()
    initTextReveals()
    initStory()
    initMarquee()
    initProjects()
    initProjectHover()
    initActiveNav()
    initCursor()
    initMagnetic()
    initFloating()
    initCanvasField()
    initThemeToggle()
    setTimeout(() => {
    ScrollTrigger.refresh()
}, 300)
})

/* Theme toggle: persists preference to localStorage and updates DOM */
function setTheme(theme) {
    const root = document.body
    if (theme === 'light') {
        root.classList.add('light-theme')
        localStorage.setItem('theme', 'light')
    } else {
        root.classList.remove('light-theme')
        localStorage.setItem('theme', 'dark')
    }
    updateThemeIcon()
}

function getStoredTheme() {
    return localStorage.getItem('theme')
}

function updateThemeIcon() {
    const btn = document.getElementById('theme-toggle')
    if (!btn) return
    const isLight = document.body.classList.contains('light-theme')
    btn.innerHTML = isLight ? '<ion-icon name="sunny-outline"></ion-icon>' : '<ion-icon name="moon-outline"></ion-icon>'
    btn.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme')
}

function initThemeToggle() {
    const btn = document.getElementById('theme-toggle')
    if (!btn) return

    // Initialize theme from stored value or system preference
    const stored = getStoredTheme()
    if (stored) {
        setTheme(stored)
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        setTheme('light')
    } else {
        setTheme('dark')
    }

    btn.addEventListener('click', () => {
        const isLight = document.body.classList.contains('light-theme')
        setTheme(isLight ? 'dark' : 'light')
    })
}
