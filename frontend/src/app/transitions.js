"use client"

import { useEffect } from "react"

// Function to handle scroll reveal animations
export function useScrollReveal() {
  useEffect(() => {
    const revealElements = document.querySelectorAll(".reveal-on-scroll")

    const revealOnScroll = () => {
      const windowHeight = window.innerHeight

      revealElements.forEach((element) => {
        const elementTop = element.getBoundingClientRect().top
        const elementVisible = 150

        if (elementTop < windowHeight - elementVisible) {
          element.classList.add("revealed")
        } else {
          element.classList.remove("revealed")
        }
      })
    }

    window.addEventListener("scroll", revealOnScroll)
    // Trigger once on load
    revealOnScroll()

    return () => window.removeEventListener("scroll", revealOnScroll)
  }, [])
}

// Function to create parallax effect
export function useParallax() {
  useEffect(() => {
    const parallaxElements = document.querySelectorAll(".parallax-scroll")

    const handleParallax = () => {
      parallaxElements.forEach((element) => {
        const scrollPosition = window.pageYOffset
        const speed = element.dataset.speed || 0.5
        element.style.transform = `translateY(${scrollPosition * speed}px)`
      })
    }

    window.addEventListener("scroll", handleParallax)

    return () => window.removeEventListener("scroll", handleParallax)
  }, [])
}

// Function to create tilt effect
export function useTiltEffect() {
  useEffect(() => {
    const tiltElements = document.querySelectorAll(".tilt-effect")

    const handleTilt = (e, element) => {
      const rect = element.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const centerX = rect.width / 2
      const centerY = rect.height / 2

      const tiltX = (y - centerY) / 10
      const tiltY = (centerX - x) / 10

      element.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`
    }

    const resetTilt = (element) => {
      element.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)"
    }

    tiltElements.forEach((element) => {
      element.addEventListener("mousemove", (e) => handleTilt(e, element))
      element.addEventListener("mouseleave", () => resetTilt(element))
    })

    return () => {
      tiltElements.forEach((element) => {
        element.removeEventListener("mousemove", (e) => handleTilt(e, element))
        element.removeEventListener("mouseleave", () => resetTilt(element))
      })
    }
  }, [])
}

// Function to create staggered animations
export function useStaggeredAnimation(selector, baseDelay = 100) {
  useEffect(() => {
    const elements = document.querySelectorAll(selector)

    elements.forEach((element, index) => {
      element.style.animationDelay = `${index * baseDelay}ms`
    })
  }, [selector, baseDelay])
}

// Custom hook for smooth counter animation
export function useSmoothCounter(ref, endValue, duration = 2000) {
  useEffect(() => {
    if (!ref.current) return

    const element = ref.current
    const startValue = 0
    const increment = endValue / (duration / 16)
    let currentValue = startValue

    const counter = setInterval(() => {
      currentValue += increment

      if (currentValue >= endValue) {
        clearInterval(counter)
        element.textContent = endValue
      } else {
        element.textContent = Math.floor(currentValue)
      }
    }, 16)

    return () => clearInterval(counter)
  }, [ref, endValue, duration])
}

// Animation controller for page transitions
export function AnimationController({ children }) {
  useScrollReveal()
  useParallax()
  useTiltEffect()

  return children
}
