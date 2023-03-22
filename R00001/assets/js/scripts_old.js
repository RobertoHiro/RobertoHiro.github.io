let options = {
    token: null,
    meses: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
}

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
                        'ipt-start" readonly="readonly" style="display: inline-block; width: 165px"></div> <button class="ui-button ui-widget ui-corner-all btn-report" style="margin-top: -6px; ' +
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
                
                let report = $('#' + ID + ' .btn-report');
                let preview = $('#' + ID + ' .content-data .preview');
                let loading = $('#' + ID + ' .content-data .loading');

                
                let arrayObjValueOnGraphics = [
                    {
                        x:'responsavel_label',
                        y:'valorTotalComissao',
                        description:'Relatório de Responsavel/Total comissão',
                        drilldown:null
                    },
                    {
                        x:'responsavel_label',
                        y:'valorTotalTrabalhado',
                        description:'Relatório de Responsavel/Total trabalho',
                        drilldown:null
                    },
                    {
                        x:'cliente_label',
                        y:'valorTotalTrabalhado',
                        description:'Relatório de Cliente/Total trabalho',
                        drilldown:null
                    },
                    {
                        x:'tipo de renda [Fixa/Variável]',
                        y:'valorTotalComissao',
                        description:'Renda fixa/variável da comissão',
                        drilldown:{
                            reference:'responsavel',
                            fields:[
                                {label:'valorTotalComissao',drilldown:{}},
                                {label:'valorTotalTrabalhado',drilldown:{}}
                            ]}
                    },
                    {
                        x:'tipo de renda [Fixa/Variável]',
                        y:'valorTotalTrabalhado',
                        description:'Renda fixa/variável do trabalho',
                        drilldown:{
                            reference:'responsavel',
                            fields:[
                                {label:'valorTotalComissao',drilldown:{}},
                                {label:'valorTotalTrabalhado',drilldown:{}}
                            ]}
                    },
                    {
                        x:'responsavel_label',
                        y:'valorTotalTrabalhado',
                        description:'grafico de teste',
                        drilldown:{
                            reference:'responsavel',
                            fields:[
                                {
                                    x:'responsavel_label',
                                    y:'valorTotalComissao',
                                    description:'grafico de drill',
                                    drilldown:{
                                        reference:'responsavel',
                                        fields:[
                                        {
                                            x:'responsavel_label',
                                            y:'valorTotalComissao',
                                            description:'grafico de drill 2',
                                            drilldown:[]
                                        }
                                        ]
                                    }
                                },
                                {
                                    x:'cliente_label',
                                    y:'valorTotalTrabalhado',
                                    description:'grafico de drill',
                                    drilldown:[]
                                }
                            ]
                        },
                    },
                    {
                        x:'responsavel_label',
                        y:'valorTotalTrabalhado',
                        description:'grafico de teste dinamico',
                        drilldown:{
                            reference:'responsavel',
                            fields:[
                                {
                                    x:'responsavel_label',
                                    y:'valorTotalComissao',
                                    description:'teste dinamico drill',
                                    drilldown:{}
                                },
                                {
                                    x:'cliente_label',
                                    y:'valorTotalTrabalhado',
                                    description:'teste dinamico drill cliente',
                                    drilldown:{
                                        reference:'cliente',
                                        fields:[
                                            {
                                                x:'cliente_label',
                                                y:'valorTotalTrabalhado',
                                                description:'teste dinamico drill',
                                                drilldown:{}
                                            }
                                        ]
                                    }
                                }
                            ]
                        }
                    },
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
                        let startSelected = date[2] + '-' + date[1] + '-' + date[0] + 'T00:00:00';
                        let endSelected = selectedOption;
                        let options = {
                            filters: [
                                startSelected, endSelected
                            ]
                        };

                        let data = _loadStuffData('r-yza-spcxa-01_view', options);

                        let arrayObjValueOnGraphicsSelected = arrayObjValueOnGraphics[selectedOption];

                        preview.append('<canvas class="my-chart"></canvas>');
                        let result = $self._agregation(data, arrayObjValueOnGraphicsSelected.x, arrayObjValueOnGraphicsSelected.y, $self);
                        let descricao = arrayObjValueOnGraphicsSelected.description;
                        if (arrayObjValueOnGraphicsSelected.drilldown!=null){
                            drilldown._generateChartDrill(descricao, result, '.my-chart', arrayObjValueOnGraphicsSelected.drilldown, preview, ID, $self);
                        }else{
                            $self._generateChartBar(descricao, result, '.my-chart');
                        }
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

            if (ID && data && data.size > 0) {
                let rgbs = [];
                let _labels = [];
                let _values = [];
                
                //console.log('description: '+description);
                //console.log(data);

                for (let item of data.entries()) {
                    rgbs.push($self._generateRGB());
                    _labels.push(item[0]);
                    _values.push(item[1]);
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

        _destroy: function () {
            $(this.element).empty();
        }
    });

});



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
            url: 'http://app.chutzy.com:8080/jarvis/oauth/token',
            data: JSON.stringify(options),
            type: 'POST',
            async: false,
            headers: {
                'Authorization': 'Basic d2ViQGphcnZpcy4yMDIxOkpjTko0ZkVT'
            },

        });
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
