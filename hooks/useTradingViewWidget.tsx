"use client";

import { useEffect, useRef } from "react";

const useTradingViewWidget = (
    scriptUrl: string,
    config: Record<string, unknown>,
    height = 600
) => {
    const containerRef = useRef<HTMLDivElement | null>(null);

    const configString = JSON.stringify(config);

    useEffect(() => {
        const container = containerRef.current;

        if (!container) return;


        container.replaceChildren();


        container.style.width = "100%";
        container.style.height = `${height}px`;


        const widget = document.createElement("div");

        widget.className =
            "tradingview-widget-container__widget";

        widget.style.width = "100%";
        widget.style.height = "100%";

        container.appendChild(widget);


        const script = document.createElement("script");

        script.src = scriptUrl;
        script.type = "text/javascript";
        script.async = true;


        script.textContent = configString;


        container.appendChild(script);


        return () => {
            container.replaceChildren();
        };
    }, [scriptUrl, configString, height]);

    return containerRef;
};

export default useTradingViewWidget;