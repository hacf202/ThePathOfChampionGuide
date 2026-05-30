import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export function HoverCard({ children, scale = 1.05, y = -5, duration = 0.2, className = "", style = {}, onClick }) {
    const container = useRef(null);
    const { contextSafe } = useGSAP({ scope: container });

    const onMouseEnter = contextSafe(() => {
        gsap.to(container.current, { scale: scale, y: y, duration: duration, ease: "power2.out" });
    });

    const onMouseLeave = contextSafe(() => {
        gsap.to(container.current, { scale: 1, y: 0, duration: duration, ease: "power2.out" });
    });

    return (
        <div 
            ref={container} 
            className={className} 
            style={style}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onClick={onClick}
        >
            {children}
        </div>
    );
}
