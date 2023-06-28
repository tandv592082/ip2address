const analysis = async () => {
    $(`small[id^="error-"]`).hide();
    $(`#table`).hide();
    $('#export2excel').hide();


    const errorMgs = {};
    const files = $('#file_upload')[0].files;
    const sheetName = $('#sheet-name').val();
    const rowName = $('#row-ip-name').val();
    let filename;

    if (!files.length) {
        errorMgs['file_upload'] = 'Please select a file!';
    } else {
        filename = files[0].name;
        const extension = filename.substring(filename.lastIndexOf(".")).toUpperCase();

        if (!(extension === '.XLS' || extension === '.XLSX' || extension === '.XLSM')) {
            errorMgs['file_upload'] = "Please select a valid excel file.";
        }
    }

    if (!sheetName) {
        errorMgs['sheet-name'] = 'Please enter sheet name!'
    }

    if (!rowName) {
        errorMgs['row-ip-name'] = 'Please enter ip row name!';
    }

    // check valid form
    const invalidForm = Object.keys(errorMgs);

    if (invalidForm.length) {
        Object.entries(errorMgs).map((pair) => {
            $(`#error-${pair[0]}`).show().text(pair[1]);
        })

        enableLayout();
        return;
    }


    let excel = {};
    try {
        const reader = new FileReader();
        reader.readAsBinaryString(files[0]);

        reader.onload = async function (e) {
            disableLayout();
            const data = e.target.result;
            const workbook = XLSX.read(data, {
                type: 'binary'
            });

            workbook.SheetNames.map((sheetName) => {
                const roa = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
                if (roa.length > 0) {
                    excel[sheetName] = roa;
                }
            });

            let sheet = excel[sheetName];

            if (!sheet) {
                $(`#error-sheet-name`).show().text(`Sheet ${sheetName} does not exist or contain empty row!`);
                enableLayout();
                return;
            }

            if (!sheet.length) {
                $(`#error-sheet-name`).show().text(`Sheet ${sheetName} not contain any row name!`);
                enableLayout();
                return;
            }

            const ips = sheet.map(row => row[rowName]);

            if (ips.every(k => k === undefined)) {
                $(`#error-row-ip-name`).show().text(`Row ${rowName} does not exist!`);
                enableLayout();
                return;
            }

            const promises = ips.map(getAddressFromIp);
            const result = await Promise.all(promises);

            enableLayout();
            renderTable(result);
            $('#export2excel').show().click((e) => {
                e.preventDefault();
                downloadXLS(result);
            })

        }

    } catch (e) {
        console.error(e);
    }
}


const renderTable = (data) => {
    $('#table').dataTable().fnDestroy();
    $('#table').show().DataTable({
        data,
        columns: [
            { data: 'ip' },
            { data: 'city' },
            { data: 'country' },
        ],
        "pageLength": 10
    });
}

const getAddressFromIp = async (ip) => {
    const endpoint = `/ip-to-location/${ip}`;
    const response = await fetch(endpoint);
    let data;

    if (response.ok) {
        data = await response.json();
    }

    const { country, city } = data ?? {};
    return {
        ip,
        city: city ?? 'N/A',
        country: country ?? 'N/A',
    };

}

const disableLayout = () => {
    $(`#loading`).show();
    $('input').attr('disabled', true);
    $('button').attr('disabled', true);
}

const downloadXLS = (xlsRows) => {
    $("#table-download-body").empty();
    const createXLSLFormatObj = [];

    /* XLS Head Columns */
    const xlsHeader = ["IP", "City", 'Country'];
    createXLSLFormatObj.push(xlsHeader);

    $.each(xlsRows, function (index, value) {
        const innerRowData = [];
        $("#table-download-body").append('<tr><td>' + value.ip + '</td><td>' + value.city + '</td><td>' + value.country + '</td></tr>');

        $.each(value, function (ind, val) {

            innerRowData.push(val);
        });
        createXLSLFormatObj.push(innerRowData);
    });


    /* File Name */
    const filename = "IP_TO_LOCATION.xlsx";

    /* Sheet Name */
    const ws_name = "IP TO LOCATION";

    if (typeof console !== 'undefined') console.log(new Date());
    const wb = XLSX.utils.book_new(),
        ws = XLSX.utils.aoa_to_sheet(createXLSLFormatObj);

    /* Add worksheet to workbook */
    XLSX.utils.book_append_sheet(wb, ws, ws_name);

    /* Write workbook and Download */
    if (typeof console !== 'undefined') console.log(new Date());
    XLSX.writeFile(wb, filename);
    if (typeof console !== 'undefined') console.log(new Date());

}


const enableLayout = () => {
    $(`#loading`).hide();
    $('input').removeAttr('disabled');
    $('button').removeAttr('disabled');
}

$('#explain-modal-wrapper').click(() => {
    $('#explain-modal-wrapper').hide();
})

$('.explain-modal').click((e) => {
    e.stopPropagation();
});

$('.close-modal').click((e) => {
    $('#explain-modal-wrapper').hide();
})


$('span[id^=explain-').click(function () {
    switch ($(this).attr('id').replace('explain-', '')) {
        case 'row-ip-name':
            $('.modal-title').text('IP row name');
            $(".image-explain").attr("src", "./assets/images/row-ip-name.png");
            break;
        case 'sheet-name':
            $('.modal-title').text('Sheet name');
            $(".image-explain").attr("src", "./assets/images/sheet-name.png");
            break;
        default:
            break;
    }

    $('#explain-modal-wrapper').css('display', 'flex');
});

