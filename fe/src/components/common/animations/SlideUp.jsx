import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export function SlideUp({ children, y = 30, duration = 0.5, delay = 0, className = "", style = {} }) {
    const container = useRef(null);

    useGSAP(() => {
        gsap.from(container.current, {
            opacity: 0,
            y: y,
            duration: duration,
            delay: delay,
            ease: "power3.out"
        });
    }, { scope: container });

    return (
        <div ref={container} className={className} style={style}>
            {children}
        </div>
    );
}
