import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

// The container manages the stagger animation for its children.
export function StaggerContainer({ children, stagger = 0.05, y = 20, duration = 0.4, className = "", style = {} }) {
    const container = useRef(null);

    useGSAP(() => {
        gsap.from(".stagger-item", {
            opacity: 0,
            y: y,
            duration: duration,
            stagger: stagger,
            ease: "power2.out",
            clearProps: "all"
        });
    }, { scope: container });

    return (
        <div ref={container} className={className} style={style}>
            {children}
        </div>
    );
}

// Wrap items with this class to be targeted by StaggerContainer
export function StaggerItem({ children, className = "", style = {}, onClick }) {
    return (
        <div className={`stagger-item ${className}`} style={style} onClick={onClick}>
            {children}
        </div>
    );
}
