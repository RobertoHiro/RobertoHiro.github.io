
//controle do tipo de drilldown será utilizado
drilldown = {
    drilldownType:{APPEND:0, MODAL:1, NEWTAB:2},
    selectedDrilldownType:0,

    _agregationDrill(data, arrayOptionsDrill, drilldownArray, itemIndex) {
        var result = new Map();
        
        var drilldownCampos = drilldownArray['fields'];
        let drilldownValue = drilldownCampos[itemIndex];
        var drilldownReference = drilldownArray['reference'];
        let stgXSplited;
        var labelName = [];
        var labelKey = [];

        data.forEach((value)=>{
            if(value[drilldownReference]==arrayOptionsDrill.split(' : ')[1]){
                
                if(drilldownValue.x.includes('_label')){
                    stgXSplited = drilldownValue.x.split('_label')[0];
                    if(result.has(value[stgXSplited])){
                        result.set(value[stgXSplited], value[drilldownValue.y]+result.get(value[stgXSplited]));
                    }else{
                        result.set(value[stgXSplited], value[drilldownValue.y]);
                        labelName[labelName.length] = value[drilldownValue.x] +' : '+ value[drilldownValue.x.split('_label')[0]];
                        labelKey[labelKey.length] = value[stgXSplited];
                    }
                }
                else{
                    if(result.has(value[drilldownValue.x])){
                        result.set(value[drilldownValue.x], value[drilldownValue.y]+result.get(value[drilldownValue.x]));
                    }else{
                        result.set(value[drilldownValue.x], value[drilldownValue.y]);
                    }
                }
            }
        });
        if(drilldownValue.x.includes('_label')){
            var labelResult = new Map();
            stgXSplited = drilldownValue.x.split('_label')[0];
            for (let i = 0; i < labelName.length; i++) {
                labelResult.set(labelName[i], result.get(labelKey[i]));
            }
            return labelResult;
        }
    },

    _generateChartDrill(description, data, classMyChart, drilldownArray, preview, ID, $self) {
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
                    },
                    onClick:(e,items)=>{
                        let backgroundColor = _backgrounds[items['0']['index']];
                        let borderColor = _borders[items['0']['index']];
                        drilldown._showDrilldown(e,items, drilldownArray, preview, backgroundColor, borderColor,0);
                    }
                }
            });
        }
    },

    _showDrilldown(e,items, drilldownArray, preview, backgroundColor, borderColor, indexCanvas){
        switch (this.selectedDrilldownType) {
            case this.drilldownType.APPEND:
                this._showDrilldownAppend(e,items, drilldownArray, preview, backgroundColor, borderColor, indexCanvas);
                break;

            case this.drilldownType.MODAL:
                this._showDrilldownModal(e,items, drilldownArray, preview, backgroundColor, borderColor, indexCanvas);
                break;

            case this.drilldownType.NEWTAB:
                this._showDrilldownNewtab(e,items, drilldownArray, preview, backgroundColor, borderColor, indexCanvas);
                break;

            default:
                break;
        }
    },

    quantitiesDrillAppended:0,

    _showDrilldownAppend(e, items, drilldownArray, preview, backgroundColor, borderColor, indexCanvas){
        const ID = $(this.element).attr('id');
        let eChartDataLabels = e['chart']['data']['labels'];
        this.quantitiesDrillAppended = indexCanvas+1;
        if(items['0']==null)
            return;
        let selectedEChartDataLabels = eChartDataLabels[items['0']['index']];
        let canvasClass = 'my-chart-'+indexCanvas;

        if(indexCanvas==0){
            var filteDivClass = $('.appendID');
            $.each(filteDivClass,(index, item)=>{
                item.remove();
            });
        }

        preview.append(
            '<div class="appendID">'+
                '<canvas class="'+canvasClass+'"></canvas>'+
            '</div>');

        let dataDrill = _loadStuffData('r-yza-spcxa-01_view', options);

        let resultDrill = this._agregationDrill(dataDrill, selectedEChartDataLabels, drilldownArray, items['0']['index']);
        let descricaoDrill = drilldownArray['fields'][items['0']['index']].description;

        //console.log('resultDrill');
        //console.log(resultDrill);
        
        let _labels = [];
        let _values = [];
        for (let item of resultDrill.entries()) {
            _labels.push(item[0]);
            _values.push(item[1]);
        }

        let ctx = $('.appendID .'+canvasClass);
        var myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: _labels,
                datasets: [{
                        label: descricaoDrill,
                        data: _values,
                        backgroundColor: backgroundColor,
                        borderColor: borderColor,
                        borderWidth: 1
                    }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                onClick:(e,itemsDrill)=>{
                    let drilldownArrayAgain = drilldownArray.fields[items['0']['index']].drilldown;
                    if(Object.keys(drilldownArrayAgain).length>0){
                        let indexFromClassPlus = Number(ctx.attr('class').split('my-chart-')[1])+1;
                        if(indexFromClassPlus <= this.quantitiesDrillAppended){
                            for (let i = indexFromClassPlus; i < this.quantitiesDrillAppended; i++) {
                                let chartToRemove = '.my-chart-'+i;
                                $(chartToRemove).remove();
                            }
                        }
                        //console.log('criando novo show Drill');
                        this._showDrilldownAppend(e, itemsDrill, drilldownArrayAgain, preview, backgroundColor, borderColor,indexFromClassPlus);
                    }
                }
            }
        });
    },

    _showDrilldownModal(e, items, drilldownArray, preview, backgroundColor, borderColor, indexCanvas){
        const ID = $(this.element).attr('id');
        let eChartDataLabels = e['chart']['data']['labels'];
        if(items['0']==null)
            return;
        let selectedEChartDataLabels = eChartDataLabels[items['0']['index']];
        let canvasClass = 'my-chart-'+indexCanvas;

        preview.append(
            '<div id="modalID'+indexCanvas+'" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">'+
                '<div class="modal-dialog modal-lg"> '+
                    '<div class="modal-content">'+
                        '<div class="modal-header">'+  
                            '<button type="button" class="close" aria-label="Close">'+
                                '<span aria-hidden="true" style="display: inline;color: black;">&times;</span>'+
                            '</button>'+
                        '</div>'+
                        '<div class="modal-body">'+
                            '<canvas class="'+canvasClass+'"></canvas>'+
                        '</div>'+
                    '</div>'+
                '</div>'+
            '</div>');
        let modalDrilldwon = $('#modalID'+indexCanvas);
        modalDrilldwon.modal('show');
        modalDrilldwon.on('hidden.bs.modal', function (e) {
            modalDrilldwon.remove();
        });
        let btnCloseAllModal = $('.modal-header .close');
        btnCloseAllModal.on('click', function(e){
            for (let i = indexCanvas; i > -1; i--) {
                $('#modalID'+i).modal('hide');
            }
        });

        let dataDrill = _loadStuffData('r-yza-spcxa-01_view', options);

        let resultDrill = this._agregationDrill(dataDrill, selectedEChartDataLabels, drilldownArray, items['0']['index']);
        let descricaoDrill = drilldownArray['fields'][items['0']['index']].description;;
        
        let _labels = [];
        let _values = [];
        for (let item of resultDrill.entries()) {
            _labels.push(item[0]);
            _values.push(item[1]);
        }

        let ctx = $('.modal .'+canvasClass);
        var myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: _labels,
                datasets: [{
                        label: descricaoDrill,
                        data: _values,
                        backgroundColor: backgroundColor,
                        borderColor: borderColor,
                        borderWidth: 1
                    }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                onClick:(e,itemsDrill)=>{
                    let drilldownArrayAgain = drilldownArray.fields[items['0']['index']].drilldown;
                    if(Object.keys(drilldownArrayAgain).length>0){
                        let indexFromClassPlus = Number(ctx.attr('class').split('my-chart-')[1])+1;
                        if(indexFromClassPlus <= this.quantitiesDrillAppended){
                            for (let i = indexFromClassPlus; i < this.quantitiesDrillAppended; i++) {
                                let chartToRemove = '.my-chart-'+i;
                                $(chartToRemove).remove();
                            }
                        }
                        //console.log('criando novo show Drill');
                        this._showDrilldownModal(e, itemsDrill, drilldownArrayAgain, preview, backgroundColor, borderColor,indexFromClassPlus);
                    }
                }
            }
        });
    },

    _showDrilldownNewtab(e, items, drilldownArray, preview, backgroundColor, borderColor, indexCanvas){     
        const ID = $(this.element).attr('id');
        let eChartDataLabels = e['chart']['data']['labels'];
        if(items['0']==null)
            return;
        let selectedEChartDataLabels = eChartDataLabels[items['0']['index']];
        let canvasClass = 'my-chart-'+indexCanvas;

        /*
        if(indexCanvas==0){
            var filteDivClass = $('.appendID');
            $.each(filteDivClass,(index, item)=>{
                item.remove();
            });
        }
        */
/*
        preview.append(
            '<div id="appendID">'+
                '<canvas class="'+canvasClass+'"></canvas>'+
            '</div>');
            */
           
        var windowsIndex = 'w'+indexCanvas;
        console.log(windowsIndex);
        //https://javascript.info/popup-windows
        var myWindow = window.open('about:blank','_blanck','popup');
        var doc = myWindow.document;

        /*
        var htmlString = '<div id="appendID"><canvas class="'+canvasClass+'"></canvas></div>';
        myWindow.document.write('<div id="appendID"><canvas class="'+canvasClass+'"></canvas></div>');
        */
        
        var newDiv = document.createElement('div');
        newDiv.setAttribute('class','appendID');
        var newCanvas = document.createElement('canvas');
        newCanvas.setAttribute('class',canvasClass);

        newDiv.append(newCanvas);
        doc.body.appendChild(newDiv); 
        
        let dataDrill = _loadStuffData('r-yza-spcxa-01_view', options);

        //let resultDrill = this._agregationDrill(dataDrill, selectedEChartDataLabels, drilldownArray);
        let resultDrill = this._agregation(dataDrill, selectedEChartDataLabels, drilldownArray);
        let descricaoDrill = selectedEChartDataLabels;
        
        let _labels = [];
        let _values = [];
        for (let item of resultDrill.entries()) {
            _labels.push(item[0]);
            _values.push(item[1]);
        }
        let ctx = $('.appendID .'+canvasClass);
        console.log(newCanvas);
        //let ctx = doc.getElementById('appendID');
        //var myChart = new Chart(ctx, {
        var myChart = new Chart(newCanvas, {
            type: 'bar',
            data: {
                labels: _labels,
                datasets: [{
                        label: descricaoDrill,
                        data: _values,
                        backgroundColor: backgroundColor,
                        borderColor: borderColor,
                        borderWidth: 1
                    }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                onClick:(e,items)=>{
                    indexCanvas++;
                    console.log(drilldownArray);
                    this._showDrilldownNewtab(e, items, drilldownArray, preview, backgroundColor, borderColor,indexCanvas);
                }
            }
        }); 
        /*
        doc.open();
        doc.write(ctx);
        doc.close();      
        */ 
        doc.close();    
    },
};