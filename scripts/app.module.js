// https://bankofgeorgia.ge/en/currencies

class App {
    
    tl = 0;

    constructor() {

        let _this =  this;
        // get default data
        chrome.storage.local.get(["lari_in_lira"]).then((result) => {
            _this.tl = result.lari_in_lira;
        });
        
        // get input from popup
        chrome.runtime.onMessage.addListener(
            function(request, sender, sendResponse) {
                if(!sender.tab) {
                    _this.tl = request.greeting;
                    $('.converted-price').remove();
                    _this.addCurrency();
                }
            }
        );
        console.log('Trendyol Converter Activated...')
        // loop
        setInterval(() => _this.addCurrency(), 100);

        _this.loadTranslatedWords();
        setInterval(() => _this.CategoriesTranslator(), 100);

        _this.appendTab();
    }
    addCurrency()
    {
        let _this =  this;
        const parentTag = 'div,p,span';
        let priceBox = $("font:contains('TL'),font:contains('ლირა')");
        $.each(priceBox, function(key, element) {
            let getPrice = $(element).closest(parentTag).text();
            let price = _this.priceConverter( getPrice );
            let isPrice = $(element).closest(parentTag).find('.converted-price');
            if(isPrice.length == 0) {
                $(element).closest(parentTag).append('<font class="converted-price"> (' + price + ' GEL)</font>');
            }
        });

    }

    priceConverter(price) {
        let _this =  this;
        price = price.match(/[\d.,]+/)[0]; // get only numbers
        const pattern = /[\.,](?=\d{3})/g;
        let toLari = price.replace(pattern, '');

        toLari = parseFloat(toLari) * _this.tl;
        return toLari.toFixed(0);
    }

    loadTranslatedWords() {
        let _this = this;
        _this.translatedWords = [];
        fetch(chrome.runtime.getURL('lang/english.json'))
            .then((response) => response.json())
            .then((data) => {
                _this.translatedWords = data;
            })
            .catch((error) => console.error("Error loading JSON:", error));
    }

    CategoriesTranslator() {
        let _this = this;
        let categoryList = $('.categories-wrapper');
        
        if(categoryList.length > 0) {
            let categoriesLink = $(categoryList).find('a');
            $.each(categoriesLink, function(key, li) {
                $.each(_this.translatedWords, function(keyj, translateWord) {
                    if($(li).text().trim() === translateWord.name_tr) {
                        $(li).text(translateWord.name_en);
                    }
                })
            });

        }
    }

    appendTab() {
        let _this = this;
        $(document).ready(function () {
            $("<style>").prop("type", "text/css")
                .html(`
                    #mySidePanel {
                        position: fixed;
                        top: 0;
                        right: -350px; /* დამალული */
                        width: 350px;
                        height: 100vh;
                        background: #f8f9fa;
                        z-index: 999999 !important;
                        transition: right 0.35s ease-in-out;
                        padding: 25px;
                        display: flex;
                        flex-direction: column;
                        border-left: 2px solid #f27a1a;
                        /* box-shadow: -4px 0 12px rgba(0,0,0,0.15); */
                        font-family: Arial, sans-serif;
                    }
                    /* When Active */
                    #mySidePanel.active {
                        right: 0;
                    }

                    /* Title Style */
                    #mySidePanel strong {
                        font-size: 18px;
                        color: #f27a1a;
                        margin-bottom: 8px;
                    }

                    /* BOG Link Style */
                    #mySidePanel a {
                        font-size: 14px;
                        text-decoration: none;
                        color: #f27a1a;
                        font-weight: bold;
                        padding: 6px 0;
                    }
                    #mySidePanel a:hover {
                        text-decoration: underline;
                    }

                    /* Input + Button Wrapper */
                    #mySidePanel div[style] {
                        padding: 0 !important; /* Remove inline padding */
                        display: flex;
                        flex-direction: column;
                        gap: 10px;
                    }

                    /* Input */
                    #mySidePanel input[name="currency"] {
                        width: 100%;
                        padding: 10px 12px;
                        border: 1px solid #ccd6dd;
                        border-radius: 6px;
                        outline: none;
                        font-size: 14px;
                        background: #f5f9fc;
                        transition: border-color .2s;
                    }
                    #mySidePanel input[name="currency"]:focus {
                        border-color: #f27a1a;
                    }

                    /* Button */
                    #generate-button {
                        width: 100%;
                        padding: 10px 12px;
                        background: #f27a1a;
                        border: none;
                        border-radius: 6px;
                        font-size: 14px;
                        color: white;
                        font-weight: 600;
                        cursor: pointer;
                        transition: background .2s, transform .1s;
                    }
                    #generate-button:hover {
                        background: #f27a1a;
                    }
                    #generate-button:active {
                        transform: scale(0.97);
                    }

                    #myToggleBtn {
                        position: fixed;
                        bottom: 20px;
                        right: 20px;
                        width: 100px;
                        height: 55px;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        background: #f27a1a;
                        color: #fff;
                        border-radius: 50px;
                        cursor: pointer;
                        z-index: 1000000 !important;
                    }
                `)
            .appendTo("head");

            // Create elements
            $("body").append(`
                <div id="myToggleBtn">TRY to GEL</div>
                <div id="mySidePanel">
                    <strong>Type TRY to GEL (Sell)</strong>
                    <div style="padding: 15px">
                        <input name="currency" placeholder="0.000"> <!-- 0.0894 -->
                        <button id="generate-button">Save</button>
                    </div>
                    <a href="https://bankofgeorgia.ge/en/currencies/GEL-to-USD#commercial-rates" target="_blank" style="text-align: right">BOG Rate</a>
                </div>
            `);

            // Toggle panel
            $("#myToggleBtn").on("click", function () {
                $("#mySidePanel").toggleClass("active");
            });

            //
            let currency = $('[name="currency"]').val();

            if(currency.length == 0) {
                chrome.storage.local.get(["lari_in_lira"]).then((result) => {
                    $('[name="currency"]').val(result.lari_in_lira);
                });
            }

            $('#generate-button').on('click', function() {
                setCashSell();
            });

            function setCashSell() {
                let currency = $('[name="currency"]').val();
                $('[name="currency"]').val(currency);
                let value = $('[name="currency"]').val()
                chrome.storage.local.set({ lari_in_lira: value }).then(() => {
                    console.log("Value is set");
                });
                //

                // const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
                // const targetUrl = 'https://api.businessonline.ge/api/rates/commercial/try';
                
                // fetch(proxyUrl + targetUrl, {
                //     headers: {
                //         'Origin': '*',  // Replace with your actual domain
                //         'X-Requested-With': 'XMLHttpRequest'
                //     }
                // })
                // .then(response => response.json())
                // .then(data => {
                //     // console.log('Success:', data);
                //     $('[name="currency"]').val(data.Sell);
                //     //
                //     sendCurrencyToApp();
                //     let value = $('[name="currency"]').val()
                //     chrome.storage.local.set({ lari_in_lira: value }).then(() => {
                //         console.log("Value is set");
                //     });
                //     window.close();
                //     //
                // })
                // .catch(error => {
                //     console.error('Error:', error);
                // });
            }
            //
        });
    }
}

let app = new App();