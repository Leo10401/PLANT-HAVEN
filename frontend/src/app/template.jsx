'use client'
import { useEffect } from 'react'
import Script from 'next/script'

const Template = ({ children }) => {
    return (
        <div>
            <Script strategy="afterInteractive" id="tawk-script">
                {`
                    var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
                    (function(){
                        var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
                        s1.async=true;
                        s1.src='https://embed.tawk.to/68244f6736f29c190d212f9f/1ir6tcbii';
                        s1.charset='UTF-8';
                        s1.setAttribute('crossorigin','*');
                        s0.parentNode.insertBefore(s1,s0);
                    })();
                `}
            </Script>
            {children}
        </div>
    )
}

export default Template