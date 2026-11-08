"use client";

import { useEffect, useRef } from "react";

interface TradingViewWidgetProps {
    title?: string;
    scriptURL: string;
    config: Record<string, unknown>;
    height?: number;
    className?: string;
}

const TradingViewWidget = ({
                               title,
                               scriptURL,
                               config,
                               height = 600,
                               className = "",
                           }: TradingViewWidgetProps) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const isMarketQuotes = scriptURL.includes(
        "embed-widget-market-quotes.js"
    );

    const configString = JSON.stringify({
        ...config,
        width: "100%",
        height: height,
    });

    useEffect(() => {
        const container = containerRef.current;

        if (!container) return;

        container.replaceChildren();

        container.style.setProperty(
            "height",
            `${height}px`,
            "important"
        );

        container.style.setProperty(
            "min-height",
            `${height}px`,
            "important"
        );

        container.style.width = "100%";

        const widget = document.createElement("div");

        widget.className =
            "tradingview-widget-container__widget";

        widget.style.width = "100%";
        widget.style.setProperty(
            "height",
            `${height}px`,
            "important"
        );

        container.appendChild(widget);

        // Fix collapsed iframe height for Market Quotes.
        const fixIframeHeight = () => {
            if (!isMarketQuotes) return;

            const iframes = container.querySelectorAll("iframe");

            iframes.forEach((iframe) => {
                if (
                    iframe.style.getPropertyValue("height") !==
                    `${height}px` ||
                    iframe.style.getPropertyPriority("height") !==
                    "important"
                ) {
                    iframe.style.setProperty(
                        "height",
                        `${height}px`,
                        "important"
                    );
                }

                if (
                    iframe.style.getPropertyValue("min-height") !==
                    `${height}px`
                ) {
                    iframe.style.setProperty(
                        "min-height",
                        `${height}px`,
                        "important"
                    );
                }

                iframe.style.setProperty(
                    "width",
                    "100%",
                    "important"
                );

                iframe.style.display = "block";
            });
        };

        const observer = new MutationObserver(fixIframeHeight);

        if (isMarketQuotes) {
            observer.observe(container, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ["style", "height"],
            });
        }

        const script = document.createElement("script");

        script.type = "text/javascript";
        script.src = scriptURL;
        script.async = true;
        script.textContent = configString;

        container.appendChild(script);

        fixIframeHeight();

        return () => {
            observer.disconnect();
            container.replaceChildren();
        };
    }, [scriptURL, configString, height, isMarketQuotes]);

    return (
        <div className={`w-full min-w-0 ${className}`}>
            {title && (
                <h2 className="mb-4 text-xl font-semibold text-white">
                    {title}
                </h2>
            )}

            <div
                ref={containerRef}
                className="tradingview-widget-container w-full"
                style={{
                    height: `${height}px`,
                    minHeight: `${height}px`,
                    width: "100%",
                }}
            />

            <div className="mt-2 text-center text-xs text-gray-400">
                <a
                    href="https://www.tradingview.com/markets/"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    World markets by TradingView
                </a>
            </div>
        </div>
    );
};

export default TradingViewWidget;