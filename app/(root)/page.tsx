import TradingViewWidget from "@/components/TradingViewWidget";

import {
    MARKET_OVERVIEW_WIDGET_CONFIG,
    HEATMAP_WIDGET_CONFIG,
    TOP_STORIES_WIDGET_CONFIG,
    MARKET_DATA_WIDGET_CONFIG,
} from "@/lib/constants";

const Home = () => {
    const scriptURL =
        "https://s3.tradingview.com/external-embedding/embed-widget-";

    return (
        <div className="flex min-h-screen home-wrapper">

            <div className="w-full min-w-0">

                {/* First Section */}
                <section className="grid w-full gap-8 home-section">

                    <div className="min-w-0 md:col-span-1 xl:col-span-1">
                        <TradingViewWidget
                            title="Market Overview"
                            scriptURL={`${scriptURL}market-overview.js`}
                            config={MARKET_OVERVIEW_WIDGET_CONFIG}
                            className="custom-chart"
                        />
                    </div>

                    <div className="min-w-0 md:col-span-1 xl:col-span-2">
                        <TradingViewWidget
                            title="Stock Heatmap"
                            scriptURL={`${scriptURL}stock-heatmap.js`}
                            config={HEATMAP_WIDGET_CONFIG}
                            className="custom-chart"
                        />
                    </div>

                </section>

                {/* Second Section */}
                <section className="mt-8 w-full min-w-0">

                    <div className="grid w-full min-w-0 grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">

                        {/* Top Stories */}
                        <div className="h-full min-w-0">
                            <TradingViewWidget
                                title="Market Overview"
                                scriptURL={`${scriptURL}timeline.js`}
                                config={TOP_STORIES_WIDGET_CONFIG}
                                className="custom-chart"
                                height={600}
                            />
                        </div>

                        {/* Market Data */}
                        <div className="h-full min-w-0">

                            <div className="w-full overflow-x-auto">

                                <div className="w-full min-w-[760px]">

                                    <TradingViewWidget
                                        title="Stock Heatmap"
                                        scriptURL={`${scriptURL}market-quotes.js`}
                                        config={{
                                            ...MARKET_DATA_WIDGET_CONFIG,
                                            width: "100%",
                                            height: 600,
                                        }}
                                        className="custom-chart w-full"
                                        height={600}
                                    />

                                </div>

                            </div>

                        </div>

                    </div>

                </section>

            </div>

        </div>
    );
};

export default Home;