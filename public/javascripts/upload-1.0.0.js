var fileIndex = 0;
var data = new FormData();
var file, filedra, filelist, messages, progress;
var fileOutHtml;
var oAjax = null;

function Init(_file, _filedra, _filelist, _messages, _progress) {
    file = _file;
    filedra = _filedra;
    filelist = _filelist;
    messages = _messages;
    progress = _progress;

    if (file != null) {
        fileOutHtml = file.outerHTML;
        file.addEventListener("change", FileSelectHandler, false);
    }
    if (filedra != null) {
        filedra.addEventListener("dragover", FileDragHover, false);
        filedra.addEventListener("dragleave", FileDragHover, false);
        filedra.addEventListener("drop", FileSelectHandler, false);
    }
}
function FileSelectHandler(e) {
    FileDragHover(e);
    var files = e.target.files || e.dataTransfer.files;
    for (var i = 0; i < files.length; i++) {
        fileIndex++;
        data.append("FileData_" + fileIndex, files[i]);

        //show the thumbnail
        if (filelist != null) {
            var bigImg = document.createElement("img");
            bigImg.style.width = "50px";
            bigImg.style.height = "50px";

            //check the browser compatibility
            if (window.navigator.userAgent.indexOf("Chrome") >= 1 || window.navigator.userAgent.indexOf("Safari") >= 1) {
                bigImg.src = window.webkitURL.createObjectURL(files[i]);
            }
            else {
                bigImg.src = window.URL.createObjectURL(files[i]);
            }
            filelist.appendChild(bigImg);
        }

        //write file list information
        if (messages != null) {
            var msg = "<p>File information: <strong>" + files[i].name + "</strong> type: <strong>" + files[i].type + "</strong> size: <strong>" + files[i].size + "</strong> bytes</p>";
            messages.innerHTML = msg + messages.innerHTML;
        }
    }
}
function FileDragHover(e) {
    e.stopPropagation();
    e.preventDefault();
}
function Upload() {
    if (fileIndex > 0) {
        if (window.XMLHttpRequest) {
            oAjax = new XMLHttpRequest();
        }
        else {
            oAjax = new ActiveXObject('Microsoft.XMLHTTP');
        }
        oAjax.upload.addEventListener("progress", uploadProgress, false);
        oAjax.addEventListener("load", uploadComplete, false);
        oAjax.addEventListener("error", uploadFailed, false);
        oAjax.addEventListener("abort", uploadCanceled, false);
        oAjax.onreadystatechange = SendCallBack;
        oAjax.open("POST", "Upload");
        oAjax.send(data);
    }
}
function SendCallBack(){
    if(oAjax.readyState == 4 && oAjax.status == 200){
        location.reload();
    }
}
function uploadProgress(evt) {
    if (progress != null) {
        if (evt.lengthComputable) {
            var percentComplete = Math.round(evt.loaded * 100 / evt.total);
            progress.style.width = percentComplete + '%';
        }
        else {
            progress.innerHTML = 'unable to compute';
        }
    }
}
function uploadComplete(evt) {
    data = new FormData();
    fileIndex = 0;
    if (filelist != null) {
        filelist.innerHTML = "";
    }
    if (messages != null) {
        messages.innerHTML = "";
    }
    if (file != null) {
        file.select();
        document.execCommand('delete');
    }
    if(progress != null){
        progress.style.width = '0%';
    }
}
function uploadFailed(evt) {
    alert("upload file error.");
}
function uploadCanceled(evt) {
    alert("cancel.");
}