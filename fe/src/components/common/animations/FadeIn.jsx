import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export function FadeIn({ children, duration = 0.5, delay = 0, className = "", style = {} }) {
    const container = useRef(null);

    useGSAP(() => {
        gsap.from(container.current, {
            opacity: 0,
            duration: duration,
            delay: delay,
            ease: "power2.out"
        });
    }, { scope: container });

    return (
        <div ref={container} className={className} style={style}>
            {children}
        </div>
    );
}
