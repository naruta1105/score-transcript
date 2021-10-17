$(document).ready(function(){ 
    var testScore = { 
        name: "",
        math: 0,
        physical: 0,
        chemistry: 0
    };
    //----------------Table-------------------------------//
    var table = $("#gradeTable tbody:first"); //we have only 1 tbody-> index=0
    var header = $("#gradeTable thead");
    var isSorting = false;
    var isEditable = false;
    var isDeleting = false;
    //----------------Event-------------------------------//
    $("#btnInput").on("click", function (event) {
        event.preventDefault();
        let isInputOK = getInput();
        if (isInputOK) {
            addTable(testScore);
        }
    });
    
    $("#btnCalMean").on("click", function () {
        table.children("tr").each(function() {
            calAvg($(this).children("td"));
        });
    });

    $("#btnBest").on("click",markBest);

    // table columns = "NAME"-"MATH"-"PHYS"-"CHEM"-"AVEG"
    $("#btnSort").on("click",function() {
        isSorting = !isSorting;
        changeSortMode(isSorting);
        $(this).prop("disabled",false);
    });
    
    $("#btnEdit").on("click", function () {
        isEditable = !isEditable; // True mean In Edit Mode
        isEditable = changeEditable(isEditable);
        if (isEditable) {
            $(this).text("Cập nhật");
        } else {
            markBest();
            $(this).text("Sửa thông tin");
        }
        $(this).prop("disabled",false);
    });

    $("#btnDelete").on("click", function () {
        isDeleting = !isDeleting;
        changeDelete(isDeleting);
        $(this).prop("disabled",false);
    });
    //----------------Function-------------------------------//
    function getInput() {
        let isInputOK = true;

        testScore['name'] = $("#fullName").val() || "Giấu tên";
        testScore['math'] = parseFloat($("#mathGrade").val());
        testScore['physical'] = parseFloat($("#physicsGrade").val());
        testScore['chemistry'] = parseFloat($("#chemistryGrade").val());
        
        isInputOK = checkGrade ("Toán",testScore['math'],"mathGrade","mathError") && isInputOK;
        isInputOK = checkGrade ("Lý",testScore['physical'],"physicsGrade","phyError") && isInputOK;
        isInputOK = checkGrade ("Hóa",testScore['chemistry'],"chemistryGrade","cheError") && isInputOK;
        
        if (isInputOK) {
            $("#fullName").val("");
            $("#mathGrade").val("");
            $("#physicsGrade").val("");
            $("#chemistryGrade").val("");
        }
        
        return isInputOK;
    };

    function checkGrade (subject,grade,idValue,idError) {
        let isInputOK = true;
        if (isNaN(grade) || grade>10 || grade<0) {
            $("#"+idValue).val("");
            $("#"+idError).text(`Điểm ${subject} không đúng`);
            isInputOK = false;
        } else {
            $("#"+idError).text("");
        }
        return isInputOK;
    }

    function addTable(testInput) {
        let nRows = table.children("tr").length;
        let cellSTT = $("<td></td>").attr("data-index",`${nRows+1}`).addClass("cIndex").text(`${nRows+1}`);
        let cellName = $("<td></td>").addClass("cName").text(`${testInput['name']}`);
        let cellMath = $("<td></td>").addClass("cGrade cMath").text(`${testInput['math']}`);
        let cellPhy = $("<td></td>").addClass("cGrade cPhys").text(`${testInput['physical']}`);
        let cellChem = $("<td></td>").addClass("cGrade cChem").text(`${testInput['chemistry']}`);
        let cellAvg = $("<td></td>").addClass("cAvg").text("?");
        table.append("<tr></tr>"); // add row
        table.children("tr:last").append( // add cell
            cellSTT,cellName,cellMath,cellPhy,cellChem,cellAvg
        );
    };

    function calAvg(cells) {
        let mGrade = parseFloat(cells.eq(2).text()); //get math in column 2 grade and convert to float
        let pGrade = parseFloat(cells.eq(3).text()); //get phys in column 3 grade and convert to float
        let cGrade = parseFloat(cells.eq(4).text()); //get chem in column 4 grade and convert to float
        cells.eq(5).text(((mGrade + pGrade + cGrade)/3).toFixed(1)); //toFixed(1) is 1 decimal : 4.3
    }

    function markBest() {
        table.children("tr").each(function() {
            let avgGrade = $(this).children("td:nth-child(6)").text(); //.eq(5)
            if (avgGrade!="?") {
                if (parseFloat(avgGrade)>=8){
                    $(this).addClass("bgRed"); 
                } else {
                    $(this).removeClass("bgRed"); 
                }
            }
        });
    };

    function changeSortMode(isSort) {
        $("button").prop("disabled",isSort);
        let sortOrder = 1; // DESC
        if (isSort) {
            header.find("th").append("<br><input type='radio' name='sort'>");
            header.find("input:radio[name='sort']").each(function(index){
                $(this).on("click", function(){
                    if ($(this).is(':checked')) {
                        sortTable(index,sortOrder); 
                        sortOrder *= -1;
                    }
                });
            });
        } else {
            header.find("br").remove();
            header.find("input").remove();
        }
    };

    function sortTable(colNumber,sortOrder=1) {
        const cols = ["cIndex","cName","cMath","cPhys","cChem","cAvg"];
        const rows = $.makeArray(table.children("tr"));
        rows.sort(function(a,b) {
            return compare(a, b, colNumber,sortOrder)*sortOrder;
        });
        rebuildTable(rows);
    };

    function compare(a,b,col,sortOrder=1){
        let _a = a.children[col].textContent;
        let _b = b.children[col].textContent;
        
        if (sortOrder==1) { // always set "?" at the End
            _a = (_a=="?") ? "-?" : _a;
            _b = (_b=="?") ? "-?" : _b;   
        }

        if (isNaN(Number(_a)) || isNaN(Number(_b))) {
            _a = _a.toLowerCase();
            _b = _b.toLowerCase();
        } else {
            _a = Number(_a);
            _b = Number(_b);
        }
        // This will sort Table DESC < => 1, > => -1
        if (_a<_b) {
            return 1;
        } else if (_a>_b) {
            return -1;
        }
        return 0;
    };

    function rebuildTable(rows) {
        while (table.firstChild) {
            table.remove(table.firstChild);
        };
        let j;
        for (j=0; j<rows.length; j++) {
            table.append(rows[j]);
        }
    };

    function changeEditable(isEdit) {
        if (checkChangeOK()) {
            $("button").prop("disabled",isEdit);
            table.children("tr").each(function() {
                $(this).children("td").slice(1,5).prop("contentEditable",isEdit); // slice from 1->4 (not include 5)
                if (!isEdit) {
                    let row = $(this).children("td");
                    let avg = parseFloat(row.eq(5).text());
                    if (!isNaN(avg)) {
                        calAvg($(this).children("td"));
                    }
                }
            });
            return isEdit;
        } else {
            return true; // True mean In Edit Mode
        }
    };

    function checkChangeOK() {
        let isEditOk = true;
        $(".cGrade").each (function(index) { //index will be 0,1,2 for 1 row
            let grade = parseFloat($(this).text());
            if (isNaN(grade) || grade>10 || grade<0) {
                $(this).addClass("errorGrade");
                isEditOk = false;
            } else if ($(this).hasClass("errorGrade")) {
                $(this).removeClass("errorGrade");
            }
        });
        return isEditOk;
    }

    function changeDelete(isDeleting) {
        $("button").prop("disabled",isDeleting);
        
        if (isDeleting) { // when btnDelete is active
            $(this).text("Lưu lại");
            table.children("tr").each(function(index){
                $(this).children("td").eq(0).html("<input type='button' value='Delete' class='btnDelete'>");
                $(this).find("input").on("click", function(){$(this).closest("tr").remove();});
            });
        } else { // when btnDelete is deactive
            $(this).text("Xóa thông tin");
            table.children("tr").each(function(){
                let idx = $(this).children("td").eq(0);
                idx.html(idx.attr("data-index"));
                $(this).find("input").off("click", function(){$(this).closest("tr").remove();});
            });
            sortTable(0,sortOrder=-1); // sort table by ID ASC
            table.children("tr").each(function(index){
                let idx = $(this).children("td").eq(0);
                idx.html(index+1);
            });
        }
    };

    function resetIndex(indexCol) {
    };
});