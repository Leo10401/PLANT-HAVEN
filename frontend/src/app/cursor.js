"use client"

import { useEffect, useState, useRef } from "react"

export function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isActive, setIsActive] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const updatePosition = (e) => {
      setPosition({ x: e.clientX, y: e.clientY })
      if (!isVisible) setIsVisible(true)
    }

    const handleMouseDown = () => setIsActive(true)
    const handleMouseUp = () => setIsActive(false)
    const handleMouseLeave = () => setIsVisible(false)
    const handleMouseEnter = () => setIsVisible(true)

    window.addEventListener("mousemove", updatePosition)
    window.addEventListener("mousedown", handleMouseDown)
    window.addEventListener("mouseup", handleMouseUp)
    document.documentElement.addEventListener("mouseleave", handleMouseLeave)
    document.documentElement.addEventListener("mouseenter", handleMouseEnter)

    return () => {
      window.removeEventListener("mousemove", updatePosition)
      window.removeEventListener("mousedown", handleMouseDown)
      window.removeEventListener("mouseup", handleMouseUp)
      document.documentElement.removeEventListener("mouseleave", handleMouseLeave)
      document.documentElement.removeEventListener("mouseenter", handleMouseEnter)
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div
      className={`custom-cursor ${isActive ? "active" : ""}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    />
  )
}

// Complete magnetized component with internal hook usage
export function MagneticElement({ children, strength = 30, className = "" }) {
  const elementRef = useRef(null)
  
  useEffect(() => {
    const element = elementRef.current
    if (!element) return
    
    let bounds

    const handleMouseMove = (e) => {
      bounds = element.getBoundingClientRect()
      const centerX = bounds.left + bounds.width / 2
      const centerY = bounds.top + bounds.height / 2

      const distanceX = e.clientX - centerX
      const distanceY = e.clientY - centerY

      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY)
      const radius = bounds.width / 2

      if (distance < radius + 50) {
        const magneticPullX = (distanceX / distance) * strength
        const magneticPullY = (distanceY / distance) * strength

        element.style.transform = `translate(${magneticPullX}px, ${magneticPullY}px)`
      } else {
        element.style.transform = "translate(0px, 0px)"
      }
    }

    const handleMouseLeave = () => {
      element.style.transform = "translate(0px, 0px)"
    }

    window.addEventListener("mousemove", handleMouseMove)
    element.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      element.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [strength])
  
  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  )
}

export function LeafDecorations({ count = 10 }) {
  const [leaves, setLeaves] = useState([])

  useEffect(() => {
    const newLeaves = []
    for (let i = 0; i < count; i++) {
      newLeaves.push({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: 10 + Math.random() * 20,
        rotation: Math.random() * 360,
        delay: Math.random() * 5,
        duration: 5 + Math.random() * 10,
      })
    }
    setLeaves(newLeaves)
  }, [count])

  return (
    <>
      {leaves.map((leaf) => (
        <div
          key={leaf.id}
          className="leaf-decoration animate-leaf-fall"
          style={{
            left: leaf.left,
            top: leaf.top,
            width: `${leaf.size}px`,
            height: `${leaf.size}px`,
            transform: `rotate(${leaf.rotation}deg)`,
            animationDelay: `${leaf.delay}s`,
            animationDuration: `${leaf.duration}s`,
          }}
        />
      ))}
    </>
  )
}