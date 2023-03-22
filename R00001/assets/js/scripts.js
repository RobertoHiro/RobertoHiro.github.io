let options = {
    token: null,
    meses: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
}

let token;
let stuffCode = 'a-car-renda-01';

$(function () {
    $.widget('custom.chartBar01', {


        $self : null,
        x:0,
        selectedOption:0,


        _create: function () {

            const ID = $(this.element).attr('id');
            

            if (ID) {
            
                $self = this;
                $(this.element).append('<div class="row"> <div class="col-12 ipt-group" style="margin-left: 150px"> <label>Tipo</label> '+
                        '<select id="select" class="chzn-select" style="display: inline-block;">'+
                        '</select> <div style="display: inline-block;"><label style="display: inline-block;">Data </label> <input type="text" class="form-control calendar ' +
                        'ipt-start" readonly="readonly" style="display: inline-block; width: 165px"> <input type="text" class="form-control" id="func"/></div> <button class="ui-button ui-widget ui-corner-all btn-report" style="margin-top: -6px; ' +
                        'height: 38px" disabled> <i class="fas fa-chart-line"></i> Gerar Relatório </button> </div></div><div class="row"> <div class="col-12 ipt-group content-data" ' +
                        'style="max-height: 550px"> <div class="fa-3x loading" style="text-align: center; display: none"> <i class="fas fa-sync fa-spin" style="color: rgb(0 123 255 / 50%);"></i>' +
                        '</div><div class="preview"></div></div></div>');

                $('.calendar').datepicker({
                    changeMonth: true,
                    changeYear: true,
                    dateFormat: 'dd/mm/yy',
                    locale: 'pt-BR'
                });

                let start = $('#' + ID + ' .ipt-start');
                let select = $("#select");

                let func = $("#func");
                
                let report = $('#' + ID + ' .btn-report');
                let preview = $('#' + ID + ' .content-data .preview');
                let loading = $('#' + ID + ' .content-data .loading');

                
                let arrayObjValueOnGraphics = [
                    {
                        x:'vendedor',
                        y:'valorTotal',
                        description:'Relatorio de vendedor/Total valor vendido',
                        drilldown:null
                    }
                ];

                for (let i = 0; i < arrayObjValueOnGraphics.length; i++) {
                    const element = arrayObjValueOnGraphics[i];
                    select.append('<option value="'+i+'">'+element.description+'</option>');
                }

                drilldown.selectedDrilldownType = drilldown.drilldownType.APPEND;
                
                localStorage.clear();


                start.on('change', () => {
                    //this._enabledButton(start, end, report);
                    this._enabledButton(start, select, report);
                });

                selectedOption=0;
                select.on('change', ()=>{
                    selectedOption = $('.chzn-select option:selected').val();
                });

                report.on('click', () => {
                    loading.show();
                    preview.empty();

                    setTimeout(() => {
                        let date = $(start).val().split('/');
                        let employee = $(func).val();
                        let startSelected = date[2] + '-' + date[1] + '-' + date[0];
                        let endSelected = selectedOption;
                        console.log(startSelected);
                        let options = [{"fieldName": "data.slt_00001", "expression": "EQUAL", "value": startSelected},{"fieldName": "data.slt_00002", "expression": "EQUAL", "value": employee}];

                        let data = _loadStuffData('r-yza-spcxa-01_view', options);

                        let arrayObjValueOnGraphicsSelected = arrayObjValueOnGraphics[selectedOption];
                        preview.append('<canvas class="my-chart"></canvas><canvas class="d-chart"></canvas><canvas class="cn-chart"></canvas>')
                        preview.append('<div class="row chart_table"><table class="table" id="sellsTable"></table></div>')
                        let result = $self._agregation(data, arrayObjValueOnGraphicsSelected.x, arrayObjValueOnGraphicsSelected.y, $self);
                        let descricao = arrayObjValueOnGraphicsSelected.description;
                        $self._generateChartBar(descricao, data, '.my-chart');
                        $self._generateChartBar2("total/produto",data,'.d-chart');
                        $self._generateChartBar3("vendedor/qtd clientes", data, '.cn-chart');
                        $self._generateTable(data,"sellsTable",options);
                        loading.hide();
                    }, 500);

                });
            }



        },

        _enabledButton: function (start, end, report) {
            //if ($(start).val() && $(end).val()) {
            if ($(start).val()) {
                report.removeAttr('disabled');

            } else {
                report.attr('disabled', 'disabled');
            }
        },

        _getDate: function (value) {
            var date;
            try {
                date = $.datepicker.parseDate('dd/mm/yy', value);
            } catch (error) {
                date = null;
            }

            return date;
        },

        _agregation: function (data, stgValueOnX, stgValueOnY) {
            var result = new Map();
            let stgXSplited;
            var labelName = [];
            var labelKey = [];
            data.forEach((value)=>{
                
                if(stgValueOnX.includes('_label')){
                    stgXSplited = stgValueOnX.split('_label')[0];
                    if(result.has(value[stgXSplited])){
                        result.set(value[stgXSplited], value[stgValueOnY]+result.get(value[stgXSplited]));
                    }else{
                        result.set(value[stgXSplited], value[stgValueOnY]);
                        labelName[labelName.length] = value[stgValueOnX] +' : '+ value[stgValueOnX.split('_label')[0]];
                        labelKey[labelKey.length] = value[stgXSplited];
                    }
                }
                else{
                    if(result.has(value[stgValueOnX])){
                        result.set(value[stgValueOnX], value[stgValueOnY]+result.get(value[stgValueOnX]));
                    }else{
                        result.set(value[stgValueOnX], value[stgValueOnY]);
                    }
                }
                

                /*
                if(result.has(value[stgValueOnX])){
                    result.set(value[stgValueOnX], value[stgValueOnY]+result.get(value[stgValueOnX]));
                }else{
                    result.set(value[stgValueOnX], value[stgValueOnY]);
                }
                console.log("value: ");
                console.log(value   );
                */
                
            });
            
            
            if(stgValueOnX.includes('_label')){
                var labelResult = new Map();
                stgXSplited = stgValueOnX.split('_label')[0];
                for (let i = 0; i < labelName.length; i++) {
                    labelResult.set(labelName[i], result.get(labelKey[i]));
                }
                /*
                console.log(labelName);
                console.log(labelKey);
                console.log(labelResult);
                */
                return labelResult;
            }
            
            
            //console.log(result);
            return result;
        },
        
        _generateRGB: function () {
            return [
                Math.floor(Math.random() * 256),
                Math.floor(Math.random() * 256),
                Math.floor(Math.random() * 256)
            ];
        },

        _rgbaToString: function (rgb, opacity) {
            if (rgb.length === 3 && opacity !== null) {
                return 'rgba(' + rgb[0] + ', ' + rgb[1] + ', ' + rgb[2] + ', ' + opacity + ')';
            }
            return null;
        },

        _generateChartBar: function (description, data, classMyChart) {
            const ID = $(this.element).attr('id');
            let $self = this;

            
            if (ID && data) {
                let rgbs = [];
                let _labels = [];
                let _values = [];
                
                console.log('description: '+description);
                //console.log(data);
                let map = new Map();
                for(let item of data){
                    if(map.has(item["vendedor"]["label"])){
                        map.set(item["vendedor"]["label"], map.get(item["vendedor"]["label"]) + item["valor"]);
                    }else{
                        map.set(item["vendedor"]["label"],item["valor"]);
                    }
                }
                console.log(map.values());
                for (let [key, value] of map.entries()) {
                    rgbs.push($self._generateRGB());
                    _labels.push(key);
                    _values.push(value);
                }

                let _backgrounds = rgbs.map((item) => $self._rgbaToString(item, 0.2));
                let _borders = rgbs.map((item) => $self._rgbaToString(item, 1));

                //console.log(ID);
                let ctx = $('#' + ID + ' .content-data '+classMyChart);
                var myChart = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: _labels,
                        datasets: [{
                                label: description,
                                data: _values,
                                backgroundColor: _backgrounds,
                                borderColor: _borders,
                                borderWidth: 1
                            }]
                    },
                    options: {
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            }
        },

        _generateChartBar2: function (description, data, classMyChart) {
            const ID = $(this.element).attr('id');
            let $self = this;

            
            if (ID && data) {
                let rgbs = [];
                let _labels = [];
                let _values = [];
                
                console.log('description: '+description);
                //console.log(data);
                let map = new Map();
                for(let item of data){
                    if(map.has(item["produto"]["label"])){
                        map.set(item["produto"]["label"], map.get(item["produto"]["label"]) + item["valor"]);
                    }else{
                        map.set(item["produto"]["label"],item["valor"]);
                    }
                }
                let total = 0;
                for(let item of data){
                    total += item["valor"];
                }

                for(let item of map.entries()){
                    map.set(item[0],((map.get(item[0])/total)*100).toFixed(2));
                }

                console.log(map.values());
                for (let [key, value] of map.entries()) {
                    rgbs.push($self._generateRGB());
                    _labels.push(key);
                    _values.push(value);
                }

                let _backgrounds = rgbs.map((item) => $self._rgbaToString(item, 0.2));
                let _borders = rgbs.map((item) => $self._rgbaToString(item, 1));

                //console.log(ID);
                let ctx = $('#' + ID + ' .content-data '+classMyChart);
                var myChart = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: _labels,
                        datasets: [{
                                label: description,
                                data: _values,
                                backgroundColor: _backgrounds,
                                borderColor: _borders,
                                borderWidth: 1
                            }]
                    },
                    options: {
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        },
                        plugins: {
                            legend: {
                              labels: {
                                generateLabels: (chart) => {
                                  const datasets = chart.data.datasets;
                                  return datasets[0].data.map((data, i) => ({
                                    text: `${chart.data.labels[i]} ${data}%`,
                                    fillStyle: datasets[0].backgroundColor[i],
                                    index: i
                                  }))
                                }
                              }
                            }
                        }
                    }
                });
            }
        },

        _generateChartBar3: function (description, data, classMyChart) {
            const ID = $(this.element).attr('id');
            let $self = this;

            
            if (ID && data) {
                let rgbs = [];
                let _labels = [];
                let _values = [];
                
                console.log('description: '+description);
                //console.log(data);
                let map = new Map();
                let set = new Set();
                for(let item of data){
                    set.add(item["vendedor"]["label"]+"/"+item["cliente"]["label"]);
                }
                for(let item of set){
                    if(map.has(item.split("/")[0])){
                        map.set(item.split("/")[0], map.get(item.split("/")[0]) + 1);
                    }else{
                        map.set(item.split("/")[0],1);
                    }
                }

                console.log(map.values());
                for (let [key, value] of map.entries()) {
                    rgbs.push($self._generateRGB());
                    _labels.push(key);
                    _values.push(value);
                }

                let _backgrounds = rgbs.map((item) => $self._rgbaToString(item, 0.2));
                let _borders = rgbs.map((item) => $self._rgbaToString(item, 1));

                //console.log(ID);
                let ctx = $('#' + ID + ' .content-data '+classMyChart);
                var myChart = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: _labels,
                        datasets: [{
                                label: description,
                                data: _values,
                                backgroundColor: _backgrounds,
                                borderColor: _borders,
                                borderWidth: 1
                            }]
                    },
                    options: {
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        },
                    }
                });
            }
        },

        _generateTable : (data, idTablef,options) =>{
            $(`#${idTablef}`).append("<tr><th>Vendedor</th>  <th>Cliente</th> <th> Produto</th> <th>Quantidade</th> <th> Valor</th></tr>");
            let i = 0;
            page = 10;
            for (const item of data) {
                if(i <= page){
                    $(`#${idTablef}`).append(
                        `
                            <tr>
                                <td>${item.vendedor.label}</td>
                                <td>${item.cliente.label}</td>
                                <td>${item.produto.label}</td>
                                <td>${item.quantia}</td>
                                <td>${item.valor}</td>
                            </tr>
                        `
                    );
                    i++;
                }
                
            }
            $(`#sellsTable`).append(
                ` <tr><td colspan="5" class="table-button">
                    <button id = "getNewLines">Mostrar mais</button>
                </td></tr>`
            );
        
            $(`#getNewLines`).click(()=>getNewLinesForTable(1,options[0].value,options[1].value));
        },

        _destroy: function () {
            $(this.element).empty();
        }
    });
    
    
});

function getNewLinesForTable(page,filter1,filter2){
    let previousPage = page;
    page = 10 + (page*5);
    let i = 0;
    let options = [{"fieldName": "data.slt_00001", "expression": "EQUAL", "value": filter1},{"fieldName": "data.slt_00002", "expression": "EQUAL", "value": filter2}];
    let data = _loadStuffData('r-yza-spcxa-01_view', options);
    $("#getNewLines").parent().parent().detach();
    for(const item of data){
        if(i<=page && i>= (page-5)){
            $("#sellsTable").append(
                `
                    <tr>
                        <td>${item.vendedor.label}</td>
                        <td>${item.cliente.label}</td>
                        <td>${item.produto.label}</td>
                        <td>${item.quantia}</td>
                        <td>${item.valor}</td>
                    </tr>
                `
            );
        }
        i++;
    }
    $(`#sellsTable`).append(
        `<tr> 
        <td colspan="5" class="table-button">
            <button id = "getNewLines">Mostrar mais</button>
        </td>
        </tr>`
    );

    $(`#getNewLines`).click(()=>getNewLinesForTable(previousPage + 1,filter1,filter2));
}

function _loadStuffData (stuffCode, options) {
    let $self = this;
    let data = [];

    //pegar json local
    //0 = local storage
    //1 = local json file

    let localJsonType = 0;
    let localData;
    switch (localJsonType) {
        case 0:
            localData = JSON.parse(localStorage.getItem('localData'));
            break;
        case 1:
            let fs = require('fs');
            fs.readFile('localJson.json', 'utf-8', (err, data) => {
                if (err) {
                    throw err;
                }
                localData = JSON.parse(data.toString());
            });
            break;
    
        default:
            break;
    }

    if(false){
        console.log(localData);
        return localData;
    }
    else{
        //pegar json pela API
        console.log("data from jarvis");

        //let token = getToken();
        response = requestjarvis('p-con-venda-01',options);

        console.log('options:',options);
        if (response && Array.isArray(response) && response.length > 0) {
            response.forEach((value) => {
                console.log(options[1].value);
                if(value.data.slt_00001.split('T')[0] == options[0].value){
                    if(options[1].value){
                        if(options[1].value == value.data.slt_00002.label){
                            data.push({
                                data: value.data.slt_00001,
                                vendedor: value.data.slt_00002,
                                produto: value.data.slt_00003,
                                cliente: value.data.slt_00004,
                                quantia: value.data.ipt_00005,
                                valor: value.data.ipt_00006
                            });
                        }
                    }else{
                        data.push({
                            data: value.data.slt_00001,
                            vendedor: value.data.slt_00002,
                            produto: value.data.slt_00003,
                            cliente: value.data.slt_00004,
                            quantia: value.data.ipt_00005,
                            valor: value.data.ipt_00006
                        });
                    }
                }
            });
        }
        switch (localJsonType) {
            case 0:
                localStorage.setItem('localData', JSON.stringify(data));
                break;
            case 1:
                fs.writeFile("localJson.txt", data, function(err) {
                    if (err) {
                        console.log(err);
                    }
                });
                break;
            default:
                break;
        }

        console.log('data:',data);
        return data;

    }
}

/*
function _loadStuffData (stuffCode, options) {
    let $self = this;
    let data = [];

    //pegar json local
    //0 = local storage
    //1 = local json file

    let localJsonType = 0;
    let localData;
    switch (localJsonType) {
        case 0:
            localData = JSON.parse(localStorage.getItem('localData'));
            break;
        case 1:
            let fs = require('fs');
            fs.readFile('localJson.json', 'utf-8', (err, data) => {
                if (err) {
                    throw err;
                }
                localData = JSON.parse(data.toString());
            });
            break;
    
        default:
            break;
    }

    if(localData!=null){
        //console.log(localData);
        return localData;
    }
    else{
        //pegar json pela API
        //console.log("data from jarvis");
        $.ajax({
            url: 'http://127.0.0.1:8080/api/plot/bar1',
            data: JSON.stringify(options),
            type: 'POST',
            async: false,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            success: function (response) {
                //console.log(response);
                if (response && Array.isArray(response) && response.length > 0) {
                    response.forEach((value) => {
                        data.push({
                            responsavel: value.data.slt_00003,
                            responsavel_label: value.data.slt_00003_label,
                            valorTotalComissao: value.data.ipt_00038,
                            valorTotalTrabalhado: value.data.ipt_00014,
                            cliente: value.data.slt_00002,
                            cliente_label: value.data.slt_00002_label
                        });
                    });
                }
                switch (localJsonType) {
                    case 0:
                        localStorage.setItem('localData', JSON.stringify(data));
                        break;
                    case 1:
                        fs.writeFile("localJson.txt", data, function(err) {
                            if (err) {
                                console.log(err);
                            }
                        });
                        break;
                    default:
                        break;
                }
                
                
            },
            error: function (xhr, tx, er) {
                console.log('error', tx);
            }
        });

        return data;

    }
}
*/

function getToken(){
    $.ajax({
        url: 'http://qas-abctech.ddns.net:8080/jarvis/oauth/token',
        data: {
            "password":"39ob7i410w",
            "username":"DEV-HQNS:sga.admin",
            "grant_type":"password"
        },
        type: 'POST',
        async: false,
        headers: {
            'Authorization': 'Basic d2ViQGphcnZpcy4yMDIxOkpjTko0ZkVT'
        },
        success:function(response){
            token = response['access_token']
            console.log('Token: ',token);
            return token;
        },
        error: function(e){
            console.log('e',e);
        }
    });
}

function requestjarvis(stuffCode,filters)
{
    //let token = getToken();
    getToken();
    //console.log("Token: ",token);
    
    let headersLista = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-stuff-code': stuffCode,
            'Authorization': 'Bearer '+token
    };
    
    //console.log('headersLista: ', headersLista);
    let dataLista = JSON.stringify(options);
    console.log('dataLista: ',dataLista);
    let toReturn;
    $.ajax({
        url: 'http://qas-abctech.ddns.net:8080/jarvis/api/stuff/data/filter-entities',
        data: dataLista,
        type: 'POST',
        async: false,
        headers: headersLista,
        success:function(response){
            console.log("resposta"+response);
            toReturn = response;
        },
        error:function(e){
            console.log(e);
        }
    });
    return toReturn;

    //##request antiga
    //x = requests.post('http://app.chutzy.com:8080/jarvis/api/stuff/data/filter',json=data,headers = headers);
    //##request nova
    //#x= requests.post('http://app.chutzy.com:8080/jarvis/api/stuff/data/filter-entities',json=data,headers = headers)
}
const viewTable = (x)=>{
    
}