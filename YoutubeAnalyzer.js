const puppeteer=require('puppeteer');
const xlsx=require('xlsx');
const path=require('path');
const fs=require('fs');
let filePath;
let fileName=process.argv[2];
let link='https://youtube.com/playlist?list=PLpUZ06MlpWaBDomczo6ftjdOAL3KNLk2z';

(async function(){
    try {
        const browserOpen=await puppeteer.launch({
            headless:false,
            defaultViewport:null,
            args:['--start-maximized']
        })
        const allPages=await browserOpen.pages();
        const page=allPages[0];
        await page.goto(link);

        // to find name of the playlist
        await page.waitForSelector('#container #text');
        let name=await page.evaluate(function(select){return document.querySelector(select).innerText},'#container #text');
        console.log(name);
        // name=name.split(' ')[0];
        filePath=path.join(__dirname,fileName+".xlsx");
        /* to get data of the playlist like -> 
                                                i> no. of videos
                                                ii> no. of views 
        */
        let allData=await page.evaluate(getData,'.byline-item.style-scope.ytd-playlist-byline-renderer');
        console.log(name,allData.noOfVid,allData.noOfViews);
        let TotalVids=allData.noOfVid.split(" ")[0];
        if(TotalVids.indexOf(',')>0){
            TotalVids=TotalVids.replaceAll(',','');
        }
        console.log(TotalVids)

        // to find no. of videos in one scrolled
        await page.waitForSelector('#contents>.style-scope.ytd-playlist-video-list-renderer');
        let vidsInOneScroll=await page.evaluate(vidsInOnePage,'#contents>.style-scope.ytd-playlist-video-list-renderer');
        console.log(vidsInOneScroll);

        //to scroll down the playlist
        while(TotalVids-vidsInOneScroll>60){
            
            await page.waitForSelector('#contents>.style-scope.ytd-playlist-video-list-renderer');
            await page.evaluate(goToBottom);// to go to bottom of the page
            vidsInOneScroll=await page.evaluate(vidsInOnePage,'#contents>.style-scope.ytd-playlist-video-list-renderer');
            
        }

        let content=excelReader(filePath,name);
        // to get total list of video name, links, channel name and its link in json format
        let list=await page.evaluate(vidDetail,"#contents #video-title","#contents .yt-simple-endpoint.style-scope.yt-formatted-string");
        console.log(list.length);
        
        content=list;
        excelWriter(filePath,content,name);// to convert the json file to excel

    } catch (error) {
        console.log(error);
    }
})()

// to get data of the playlist
function getData(selector){
    let allElem=document.querySelectorAll(selector);
    let noOfVid=allElem[0].innerText;
    let noOfViews=allElem[1].innerText;
    return{
        noOfVid,
        noOfViews
    }
}

// to find total no. of videos in the playlist
function vidsInOnePage(selector){
    let vidArray=document.querySelectorAll(selector);
    return vidArray.length;
}

// to go to the ottom of the page
function goToBottom(){
    window.scrollBy(0,window.innerHeight);
}

// to get the video detail like title and link
async function vidDetail(videoSelector,channelSelector){
    let vidElem=document.querySelectorAll(videoSelector);
    let chanElem=document.querySelectorAll(channelSelector);
    let arr=[];
    for(let i=0;i<vidElem.length;i++){
        

        let vidTitle=vidElem[i].innerText;
        let vidLink=vidElem[i].href;
        let chanTitle=chanElem[i].innerText;
        let chanLink=chanElem[i].href;
        arr.push({vidTitle,vidLink,chanTitle,chanLink});

    }
    // console.log(vidTitle,chanTitle)
    return arr;
}

function excelReader(filePath,sheetName){
    if(fs.existsSync(filePath)==false){
        return [];
    }
    
    let wb=xlsx.readFile(filePath);
    let ws=wb.Sheets[sheetName];
    let ans=xlsx.utils.sheet_to_json(ws);
    return ans;
}

function excelWriter(filePath,json,sheetName){
    let newWB=xlsx.utils.book_new();
    let newWS=xlsx.utils.json_to_sheet(json);
    xlsx.utils.book_append_sheet(newWB,newWS,sheetName);
    xlsx.writeFile(newWB,filePath);
}