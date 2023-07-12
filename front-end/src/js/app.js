import {save} from 'file-saver';

const overlay = $("#overlay");
const btnUpload = $("#btn-upload");
const dropZoneElm = $("#drop-zone");
const mainElm = $("main");
const REST_API_URL = `http://localhost:8080/gallery`;
const cssLoaderHtml = `<div class="lds-facebook"><div></div><div></div><div></div></div>`;

loadAllImages();

btnUpload.on('click', () => overlay.removeClass('d-none'));
overlay.on('click', (evt) => {
    if (evt.target === overlay[0]) overlay.addClass('d-none');
});
$(document).on('keydown', (evt) => {
    if (evt.key === 'Escape' && !overlay.hasClass('d-none')) {
        overlay.addClass('d-none');
    }
});
overlay.on('dragover', (evt) => evt.preventDefault());
overlay.on('drop', (evt) => evt.preventDefault());
dropZoneElm.on('dragover', (evt) => {
    evt.preventDefault();
});
dropZoneElm.on('drop', (evt) => {
    evt.preventDefault();
    const droppedFiles = evt.originalEvent
        .dataTransfer.files;
    const imageFiles = Array.from(droppedFiles)
        .filter(file => file.type.startsWith("image/"));
    if (!imageFiles.length) return;
    overlay.addClass("d-none");
    uploadImages(imageFiles);
});
mainElm.on('click', '.image:not(.loader)', (evt)=> {
    if(evt?.target.classList.contains("image-container")){
        evt.target.requestFullscreen();
    }
});

function uploadImages(imageFiles){
    const formData = new FormData();
    imageFiles.forEach(imageFile => {
        const divElm = $(`<div class="image loader"></div>`);
        divElm.append(cssLoaderHtml);
        mainElm.append(divElm);

        formData.append("images", imageFile);
    });
    const jqxhr = $.ajax(`${REST_API_URL}/images`, {
        method: 'POST',
        data: formData,
        contentType: false,         // by default jQuery uses application/x-www-form-urlencoded
        processData: false          // by default jQuery tries to convert the data into String
    });

    jqxhr.done((imageUrlList)=> {
        imageUrlList.forEach(imageUrl => {
            const divElm = $(".image.loader").first();
            divElm.css('background-image', `url('${imageUrl}')`);
            divElm.empty();
            divElm.removeClass('loader');
        });
    });
    jqxhr.always(()=> $(".image.loader").remove());
}

function loadAllImages() {
    const jqxhr = $.ajax(`${REST_API_URL}/images`);
    jqxhr.done((imageUrlList) => {
        imageUrlList.forEach((imageUrl) => {
            const divElm = $(`<div class="image"></div>`);
            divElm.addClass('image-container');
            divElm.css('background-image', `url(${imageUrl})`);

            // Add download icon to the image
            const downloadIcon = $('<button type="button" class="btn btn-light"><svg width="40px" height="40px" viewBox="-2.4 -2.4 28.80 28.80" fill="none" xmlns="http://www.w3.org/2000/svg">\n' +
                '\n' +
                '<g id="SVGRepo_bgCarrier" stroke-width="0">\n' +
                '\n' +
                '<rect x="-2.4" y="-2.4" width="28.80" height="28.80" rx="14.4" fill="#7ed0ec"/>\n' +
                '\n' +
                '</g>\n' +
                '\n' +
                '<g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>\n' +
                '\n' +
                '<g id="SVGRepo_iconCarrier"> <path d="M3 15C3 17.8284 3 19.2426 3.87868 20.1213C4.75736 21 6.17157 21 9 21H15C17.8284 21 19.2426 21 20.1213 20.1213C21 19.2426 21 17.8284 21 15" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> <path d="M12 3V16M12 16L16 11.625M12 16L8 11.625" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> </g>\n' +
                '\n' +
                '</svg></button>');

            downloadIcon.addClass('download-button');
            downloadIcon.addClass('download-icon');

            divElm.append(downloadIcon);

            mainElm.append(divElm);
        });
    });
    jqxhr.fail(() => {});

}

mainElm.on('click', (evt)=> {
    if((evt?.target.classList.contains("download-icon"))){
        const downUrl = $(evt.target).parents('div').css('background-image').replace('url("', '').replace('")', '');;
        const imageName = downUrl.replace(`${REST_API_URL}/images/`, "");
        save(downUrl, imageName);
    }
});
