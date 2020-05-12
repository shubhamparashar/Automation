
let pup = require("puppeteer");
let fs = require("fs");
const open = require('open');


let cred = process.argv[2];
let username = process.argv[3];

( async function()
{
    try{

    
    let data = await fs.promises.readFile(cred);
     let{url, pass, user, nPost}= JSON.parse(data);

        let browser = await pup.launch({
            headless:false,
            defaultViewport:null,
            args:["--start-maximized"]
        });

        let tabs = await browser.pages();
        let tab = tabs[0];
        await tab.goto(url, {waitUntil:"networkidle2"});

        await tab.type("[name=username]", user, { delay: 100 });
        await tab.type("[name=password]", pass, { delay: 100 });

        await tab.click("[type=submit]");
        await tab.waitFor(3000)

        
        await tab.goto("https://www.instagram.com/"+username, { waitUntil: "networkidle2" })
        console.log("user reached");

        await tab.waitFor(3000)
        let element = await tab.$(".g47SY");
        let text = await tab.evaluate(element => element.textContent, element);
        if(text<nPost) nPost= text;

        await tab.waitForSelector("._2z6nI", { waitUntil: "networkidle2" })
        console.log("wait completed")
        await tab.focus("._9AhH0", { waitUntil: "networkidle2" });
        console.log("item in focus");
        await tab.click("._9AhH0");
        console.log("post opened");
        await tab.waitFor(3000)

        await tab.waitForSelector(".fr66n button", { waitUntil: "networkidle2" })
        console.log("found")
        await tab.waitFor(2000)
        await tab.click(".fr66n button", { waitUntil: "networkidle2" })
        console.log("liked")
        await tab.click("._65Bje.coreSpriteRightPaginationArrow", { waitUntil: "networkidle2" })


        let idx = 0;

        do {
            
        await tab.waitForSelector(".fr66n button", { waitUntil: "networkidle2" })
            let like = await tab.$(".fr66n button", { waitUntil: "networkidle2" })
        await like.click({delay:1000});
        console.log(idx)
        if(idx!=nPost-1){
        let next = await tab.$("._65Bje.coreSpriteRightPaginationArrow", { waitUntil: "networkidle2" })
        await next.click({delay:100});}
          idx++;
          
        } while (idx < nPost)
        // await tab.click("svg[aria-label=Close]")

        

    let images = await tab.evaluate( ()=>{
            console.log("inside image")
            let image = document.querySelectorAll("img");
            
            let url = Array.from(image).map(pic =>pic.src);

            return url

        })
    // console.log(images)

    let head = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
    </head>
    <body> \n`;
    let img=``
    for(var i =0; i<images.length;i++){ 
       img+= ` <img src="${images[i]}" alt="image${i}"> \n `
    }
    let headEnd =`</body>
    </html>`;
    
    fs.writeFileSync("images.html", head+img+headEnd);
    await browser.close();

    (async () => {
        await tab.waitFor(2000)
        await open('images.html', {"wait": true });
    })();
    
        
}catch(err){
    console.log(err);
   
}
})();




// function escapeHtml(str) { // for security reasons escape "<" (you could even improve this)
//     return str.replace(/</g, '&lt;');
// }

// const htmlTable = '<table>'
//     + `\n <tr>${col.map(c => '<th>' + escapeHtml(c) + '</th>')}</tr>`
//     + results // generate rows, use map function to map values to trs/tds
//         .map(row => ('\n <tr>' +
//             col.map(c => `\n  <td>${escapeHtml(row[c])}</td>`).join('')
//         + '\n</tr>')).join('')
//     + '\n</table>';

// fs.writeFile('/data.html', htmlTable, (err) => {
//     // ...
// });