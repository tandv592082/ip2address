const analysis = async () => {
    $(`small[id^="error-"]`).hide();
    $(`#table`).hide();
    disableLayout();

    const errorMgs = {};
    const files = $('#file_upload')[0].files;
    const sheetName = $('#sheet-name').val();
    const rowName = $('#row-ip-name').val();
    let filename;
    
    if(!files.length) {
        errorMgs['file_upload'] = 'Please select a file!';
    } else {
        filename = files[0].name;
        const extension = filename.substring(filename.lastIndexOf(".")).toUpperCase();

        if (!(extension === '.XLS' || extension === '.XLSX')) {
            errorMgs['file_upload'] = "Please select a valid excel file.";
        }
    }

    if(!sheetName) {
        errorMgs['sheet-name'] = 'Please enter sheet name!'
    }

    if(!rowName) {
        errorMgs['row-ip-name'] = 'Please enter ip row name!';
    }

    // check valid form
    const invalidForm = Object.keys(errorMgs);

    if(invalidForm.length) {
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
        reader.onload = async function(e) {
            const data = e.target.result;
            const workbook = XLSX.read(data, {
                type : 'binary'
            });
            
            workbook.SheetNames.map((sheetName) => {
                const roa = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
                if (roa.length > 0) {
                    excel[sheetName] = roa;
                }
            });

            console.log(excel);
           
            let sheet = excel[sheetName];

            if(!sheet) {
                $(`#error-sheet-name`).show().text(`Sheet ${sheetName} does not exist or contain empty row!`);
                return;
            }

            if(!sheet.length) {
                $(`#error-sheet-name`).show().text(`Sheet ${sheetName} not contain any row name!`);
                return;
            }

            const ips = sheet.map(row => row[rowName]);

            if(ips.every(k => k === undefined)) {
                $(`#error-row-ip-name`).show().text(`Row ${rowName} does not exist!`);
                return;
            }

            
            const promises = ips.map(getAddressFromIp);
            const result = await Promise.all(promises);

            renderTable(result);
            
        }

    }catch(e){
        console.error(e);
    }finally {
        enableLayout();
    }
}

   

const readFileSync = (file) => new Promise((resolve) => {
    let fileReader = new FileReader();
    fileReader.onload = (e) => resolve(fileReader.result);
    fileReader.readAsDataURL(file);
});

const renderTable = (data) => {
    
    $('#table').dataTable().fnDestroy();

    $('#table').show().DataTable({
        data,
        columns: [
            { data: 'ip' },
            { data: 'address' },
        ],
        "pageLength": 10
    });
}

const getAddressFromIp = async (ip) => {
    console.log(ip);
    const uri = `http://ip-api.com/json/${ip}`;
    const response = await fetch(uri);
    let address = 'N/A';

    if(response.ok) {
        const data = await response.json();
        address = data.regionName ?? 'N/A';
    }

    return {
        ip,
        address
    };
   
}

const disableLayout = () => {
    $(`#loading`).show();
    $('input').attr('disabled', true);
    $('button').attr('disabled', true);
}


const enableLayout = () => {
    $(`#loading`).hide();
    $('input').removeAttr('disabled');
    $('button').removeAttr('disabled');
}

const bootstrap = () => {
    $(`small[id^="error-"]`).hide();
    $(`#table`).hide();
    $(`#loading`).hide();
}

bootstrap();
