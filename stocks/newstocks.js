let pup = require("puppeteer");
let fs = require("fs");
let nodemailer = require("nodemailer");
let log =require("log4js");
let open =require("open");


{// fs.writeFile("thing.json", dictstring);

// const open = require('open');
// let cred = process.argv[2];
// var d = new Date(); // for now
// let hours =d.getHours(); 
// let min = d.getMinutes(); 
// let sec =d.getSeconds(); 
}

// let time = hours +":" +min +":"+sec
let data=[];


 const stockName = process.argv[2];
 log.configure({
    appenders: { stock: { type: 'file', filename: 'stocks.log' } },
    categories: { default: { appenders: ['stock'], level: 'info' } }
  });

  // log.configure({
  // appenders: { val: { type: 'file', filename: 'val.log' } },
  // categories: { default: { appenders: ['val'], level: 'info' } }
  // });
   
  let logger = log.getLogger('price');
  // let add = log.getLogger('added');

( async function()
{
    try{

    //  let data = await fs.promises.readFile(cred);
    //  let{url}= JSON.parse(data);

        let browser = await pup.launch({
            headless:false,
            defaultViewport:null,
            args:["--start-maximized"]
        });

        let tabs = await browser.pages();
        let tab = tabs[0];
        await tab.goto("https://economictimes.indiatimes.com/", {timeout:80000});
    // await tab.waitFor(3000);
        console.log("site id opened")
        await tab.waitForSelector(".searchInputBox input", {visible:true})
        await tab.type(".searchInputBox input", stockName, { delay: 500 });
    //   await searchBar.type(stockName, { delay: 100 });

        await tab.keyboard.press("Enter");
     
        // let [val] = await tab.$x('//*[@id="ltp"]');
        // const firstVal = await val.getProperty('textContent');
        // let currentVal = firstVal;
        // console.log(currentVal);
        // loadingBg hidden

        console.log("stock page reached")
        await tab.waitForSelector(".loadingBg.hidden", {hidden:true})
        console.log("hidden")
        await tab.waitForSelector("#ltp", {visible:true})
        console.log("selector found");

        // let firstval = await tab.evaluate( ()=>{
        //         let val = document.getElementById("#ltp").textContent;
        //     console.log(val);
        //     return val
        // })

        let element = await tab.$("#ltp");
        const firstVal = await (await element.getProperty('textContent')).jsonValue();
        console.log(firstVal);
        let currentVal= firstVal;

        // const firstVal= 31000;
        // let currentVal = 31000;
        
                
       function percentage(currentVal, firstVal){
            return ((currentVal-firstVal)/firstVal)*100;
        }

        logger.info("-------------------setinterval started------------------------------")
// currentVal
        let count =0;

        // while(count<10){
        //  await set_interval();
        //  count++;
        // }

        // async function set_interval(){ 
        // setInterval(()=>{
        //     console.log("inside setinterval")

            for(var i = 0; i<10;){
              
              waitforloader();
              console.log(i)
              await tab.waitFor(20000);


            }
           
            async function waitforloader(){

              try{
                
                await tab.waitForSelector(".loadingBg.hidden", {hidden:true})
                await tab.waitForSelector("#ltp", {visible:true})
                let element1 = await tab.$("#ltp");
                let presentVal = await (await element1.getProperty('textContent')).jsonValue();

                // console.log(presentVal);
                // console.log(currentVal);

                let currentPro = percentage(presentVal, currentVal);

                // console.log(currentPro);

                let totalPro = percentage(presentVal, firstVal);
        
                logger.info(`Stock name: ${stockName}
                    present val: ${presentVal}
                    start val  : ${firstVal}
                    current pro: ${currentPro}
                    total pro  : ${totalPro}`);
                    var d = new Date(); // for now
                    let hours =d.getHours(); 
                    let min = d.getMinutes(); 
                    let sec =d.getSeconds(); 

                    let time = hours +":" +min +":"+sec

                    data.push({stock: presentVal,
                                Time: time});

                    {// stockData.push(presentVal);
                    // timeData.push(time);
                    // noOfData.push(count);
                    // console.log(data)
                    
                    // add.info(`data array: ${data}
                    // stockdata array : ${stockData}
                    // timedata array: ${timeData}
                    //   no :${noOfData}`);
                    // var time_data_File = JSON.stringify(timeData);
                    // fs.writeFile("timedata.json", time_data_File);

                    }

                    if(currentPro > (.05)){
                        console.log("mail send");
                      await profit(presentVal, firstVal, currentPro, totalPro);
                        currentVal =presentVal;
                        count++;
                        i++;
                     } else if(currentPro<=(-.05)){
                        console.log("Alert send");
                       await alert(presentVal, firstVal, currentPro, totalPro);
                       currentVal =presentVal;
                       count++;
                       i++;
                    }
                    
                // count++;
              }catch(err){
                console.log(err);
               
            }}
              
        
        // }, 20000);
        
        await open('https://mailtrap.io/inboxes/926324/messages', {app: 'chrome'});
        
        await adddata(); 
        
        await tab.waitFor(10000);

        await open("http://127.0.0.1:5500/stocks/index.html", {app: 'chrome'});

        
    }catch(err){
        console.log(err);
       
    }
    })();



    function adddata(){    var stock_data_File = JSON.stringify(data);   
    fs.writeFileSync("stockdata.json", stock_data_File);
    console.log(data)
  }


 
async function  profit(presentVal, firstVal, currentPro, totalPro) {
        let testAccount = await nodemailer.createTestAccount();
  
    
        let transport = nodemailer.createTransport({
            host: "smtp.mailtrap.io",
            port: 2525,
            auth: {
              user: "86bbb879e15d91",
              pass: "db609f1d8eaa66"
            }
          })
        
          let info = await transport.sendMail({
            from: '"Fred Foo 👻" <foo@example.com>', // sender address
            to: "8750parasharvishal@gmail.com", // list of receivers
            subject: "!!!***Profit***!!!", // Subject line
            text: `
                  Your ${stockName} stock is gaining its value.
                  Initial value of stock ${firstVal}.
                  and currnt value of your stock is ${presentVal}
                  which is ${currentPro}% more than last value
                  and ${totalPro}% more/less than initial value` , // plain text body
           
          })
      
  console.log("inside profit")
    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
  
    // Preview only available when sending through an Ethereal account
    // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
  }
  
  
  
  async function  alert(presentVal, firstVal, currentPro, totalPro) {
    let testAccount = await nodemailer.createTestAccount();


    let transport = nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "86bbb879e15d91",
          pass: "db609f1d8eaa66"
        }
      });
    
      
    let info = await transport.sendMail({
        from: '"Fred Foo 👻" <foo@example.com>', // sender address
        to: "8750parasharvishal@gmail.com", // list of receivers
        subject: "!!!***ALERT***!!!", // Subject line
        text: `Your ${stockName} stock is losing its value.
        Initial value of stock ${firstVal}.
        and currnt value of your stock is ${presentVal}
        which is ${currentPro}% less than last price
        and which is ${totalPro}% less/more than initial price` , // plain text body
 
        });

    console.log("inside alert")

    console.log("Message sent: %s", info.messageId);
// Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

// Preview only available when sending through an Ethereal account
// console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
// Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
  }