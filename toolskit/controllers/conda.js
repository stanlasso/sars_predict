var glob = require("glob")
const os = require('os');
var path = require('path');
var spawn = require('child_process').spawn
const CSVToJSON = require('csvtojson')
const { parse } = require("csv-parse");
const fs = require('fs');
const exec = require('child_process').exec;
const parameters = require('../controllers/parameters');
var excel = require('excel4node');
var XLSX = require('xlsx');
//// Mes fonctions pour python


const checkGenome = (req, res) => {

    res.setHeader('Content-Type', 'application/json');
    var cp = 1;
    console.log(req.body.data)
    let datas = req.body.data;
    /* var file_existe;
     const path = fichier.substring(0, fichier.length - 5) + 'fasta.fai';
     console.log('PATH : ', path)
     try {
         if (fs.existsSync(path)) {
             console.log("File exists.")
             file_existe = "OK";
         } else {
             console.log("File not exists.")
             file_existe = "KO";
         }
     } catch (err) {
         console.error(err)
     }*/
    var file_existe;
    //fichier = '/home/christian/Projet/toolskit_backend/uploads/references/human/PlasmoDB-55_Pfalciparum3D7_Genome.fasta'
    const path1 = datas[0] + '.sa';
    const path2 = datas[0] + '.pac';
    const path3 = datas[0] + '.bwt';
    const path4 = datas[0] + '.ann';
    const path5 = datas[0] + '.amb';
    console.log('PATH : ', path1, path2, path3, path4, path5)
    try {
        if (fs.existsSync(path1) && fs.existsSync(path2) && fs.existsSync(path3) && fs.existsSync(path4) && fs.existsSync(path5)) {
            console.log("File exists.")
            file_existe = "OK";
        } else {
            console.log("File not exists.")
            file_existe = "KO";
        }
    } catch (err) {
        console.error(err)
    }
    res.write(file_existe);
    res.end();
    //return file_existe
}

function runYamlFile(samples) {
    fs.writeFile('config.yaml', samples, function (err) {
        if (err) {
            throw err;
        } else {
            console.log("Config.yaml generate");
        }
    });
}

function runLog(samples) {
    fs.writeFile('console.txt', samples, function (err) {
        if (err) {
            throw err;
        } else {
            console.log("Config.yaml generate");
        }
    });
}
function genFile(snakefile_repertory, dir) {
    exec("cp " + snakefile_repertory + " . && mkdir -p " + dir, (err, stdout, stderr) => {
        if (err) { } else { }
    });
}
function unLock() {
    var conda_path = '~/miniconda3/etc/profile.d/conda.sh'
    var commandUnlock = [
        conda_path,
        conda_path + ' init',
        conda_path + ' activate snakemake',
        '~/miniconda3/condabin/conda run -v -n snakemake snakemake --unlock',
    ]
    exec(commandUnlock.join(' & '),
        function (error, stdout, stderr) {

        }
    );
}
function runSnakefile(retour) {
    retour.setHeader('Content-Type', 'application/json');
    tab = []
    let samples = '' // += 
    var conda_path = '~/miniconda3/etc/profile.d/conda.sh'
    var commands = [
        conda_path,
        conda_path + ' init',
        conda_path + ' activate snakemake',
        '~/miniconda3/condabin/conda run -v -n snakemake snakemake --cores all',
    ]
    var spawn_ = spawn(commands.join('&'), { shell: true });
    spawn_.stdout.on('data', function (data) {
        //do something
        console.log('stdout', data.toString())
        samples += data.toString()
    });
    spawn_.stderr.on('data', function (data) {
        //do something
        console.log('stderr', data.toString())
        samples += data.toString()
    });
    spawn_.on('exit', function (code) {
        console.log('on', code)
        runLog(samples)
        if (code == false) {
            fs.readFile('console.txt', function (err, data) {
                if (err) throw err;
                if (data.indexOf('100%') >= 0) {
                    retour.write('OK');
                    retour.end();
                } else {
                    retour.write('OKP');
                    retour.end();
                }
            });
        } else {
            unLock()
            retour.write('KO');
            retour.end();
        }
    });
}

function runGetExtension(datas) {
    let temp = [];
    var tab = []
    for (i = 0; i < datas.length; i++) {
        temp = datas[i].split('.');
        console.log(temp[temp.length - 1]);
        switch (temp[temp.length - 1]) {
            case 'fastq':
                console.log('fastq');
                tab.push('fastq');
                break
            case 'fq':
                console.log('fq');
                tab.push('fq');
                break;
            case 'gz':
                console.log('gz');
                if (temp[temp.length - 2] == "fastq") {
                    console.log('fastq.gz');
                    tab.push('fastq.gz');
                } else {
                    console.log('fq.gz');
                    tab.push('fq.gz');
                }
                break;
        }
    }
    return tab
}

function runGetMaqID(datas) {
    var maq = '';
    let temp = [];
    var separate =
        separate.forEach(function (item, index, array) {
            if (datas.split(item).length == 2) {
                maq = datas.split(item)[1];
            } else {
                temp = datas.split('.');
                console.log(temp[temp.length - 1]);
                switch (temp[temp.length - 1]) {
                    case 'fastq':
                        console.log('fastq');
                        maq = 'fastq';
                        break
                    case 'fq':
                        console.log('fq');
                        maq = 'fq';
                        break;
                    case 'gz':
                        console.log('gz');
                        if (temp[temp.length - 2] == "fastq") {
                            console.log('fastq.gz');
                            maq = 'fastq.gz';
                        } else {
                            console.log('fq.gz');
                            maq = 'fq.gz';
                        }
                        break;
                }
            }
        });
    return maq;
}

function identifyPairend(repertory) {
    //const  = 
    const fs = require("fs");
    var data = []
    fs.readdirSync(repertory).forEach(file => {
        data.push(file)
    });
    var separate = []
    var name = []
    var extenstion = []
    var uniqueChars = []
    var uniqueCharsEx = []
    var sample = []
    var samples = []
    var separate_R = ['_R1.', '_R2.']
    var separateR = ['.R1.', '.R2.']
    var separate_r = ['_r1.', '_r2.']
    var separater = ['.r1.', '.r2.']
    var separate1 = ['.1.', '.2.']
    var separate_1 = ['_1.', '_2.']
    var pieces = []
    //for (datas of data) {
    extenstion = runGetExtension(data)
    for (datas of data) {
        for (seps of separate_R) {
            if (datas.indexOf(seps) != -1) {
                name.push(datas.split(seps)[0] + '_R')
            }
        }
        for (seps of separateR) {
            if (datas.indexOf(seps) != -1) {
                name.push(datas.split(seps)[0] + '.R')
            }
        }
        for (seps of separate_r) {
            if (datas.indexOf(seps) != -1) {
                name.push(datas.split(seps)[0] + '_r')
            }
        }
        for (seps of separater) {
            if (datas.indexOf(seps) != -1) {
                name.push(datas.split(seps)[0] + '.r')
            }
        }
        for (seps of separate1) {
            if (datas.indexOf(seps) != -1) {
                name.push(`${datas.split(seps)[0]}'.'`)
            }
        }
        for (seps of separate_1) {
            if (datas.indexOf(seps) != -1) {
                name.push(datas.split(seps)[0] + '_')
            }
        }
    }
    name.forEach((c) => {
        if (!uniqueChars.includes(c)) {
            uniqueChars.push(c);
        }
    });
    extenstion.forEach((c) => {
        if (!uniqueCharsEx.includes(c)) {
            uniqueCharsEx.push(c);
        }
    });
    console.log('----', uniqueCharsEx)
    return { 'sample': uniqueChars, 'extension': uniqueCharsEx }
}
/// Mes Routers  =>
const getData = (req) => {
    var id = req; //.params.data;
    console.log('get', id)
    var dirPath = '';
    var extension = '';
    var filesList;
    switch (id) {
        case 'data':
            dirPath = path.resolve('data/'); // path to your directory goes here
            break
        case 'fastqc':
            dirPath = path.resolve('./uploads/'); // path to your directory goes here
            extension = '.xls'
            break;
        case 'parasite':
            dirPath = path.resolve('ref/3D7/'); // path to your directory goes here
            break;
        case 'human':
            dirPath = path.resolve('ref/human/');
            break;
        case 'cleaning':
            dirPath = path.resolve('res/cleaning/');
            break;
        case 'filter':
            dirPath = path.resolve('res/filter/');
            break;
        case 'alignement':
            dirPath = path.resolve('res/bam/');
            break;
        default:
            console.log('RIEN')
    }
    console.log(dirPath)
    fs.readdir(dirPath, function (err, files) {
        try {
            filesList = files.filter(function (e) {
                return path.extname(e).toLowerCase() === extension;
                /*   
                if (dirPath == path.resolve('res/fastqc/')) {
                      return path.extname(e).toLowerCase() === '.html'
                */
            });
            console.log(filesList + '============================')
            //   res.json(filesList);
        } catch (error) {
            console.log(error.message)
            //    res.json('Voir repertoire NGS TOOLS KIT');
        }
    });
}
const getTreads = (req, res) => {
    const cpuCount = os.cpus().length;
    res.json(cpuCount);
}
const getGenomHuman = (req, res) => {
    var dirPath = path.resolve("ref/human/"); // path to your directory goes here
    var filesList;
    fs.readdir(dirPath, function (err, files) {
        filesList = files.filter(function (e) {
            return path.extname(e).toLowerCase() === '.fasta'
            //|| path.extname(e).toLowerCase() === '.fa' || path.extname(e).toLowerCase() === '.fastq'
        });
        res.json(filesList);
    });
}
const getGenomParasite = (req, res) => {
    var dirPath = path.resolve("ref/3D7/"); // path to your directory goes here
    var filesList;
    fs.readdir(dirPath, function (err, files) {
        filesList = files.filter(function (e) {
            return path.extname(e).toLowerCase() === '.fasta'
            //|| path.extname(e).toLowerCase() === '.fa' || path.extname(e).toLowerCase() === '.fastq'
        });
        res.json(filesList);
    });
}
const runFastqc = (req, res) => {
    console.log(req.body)

    var data_ = req.body//identifyPairend("./uploads/data").sample
    //var extension_ = identifyPairend("./uploads/data").extension
    // console.log('----------------',identifyPairend("./uploads/data").sample)
    var cp = 1;
    var cj = 1;
    let samples = "samples : \n";
    for (i = 0; i < data_.length; i++) {
        samples += "    sample_" + cp + " : " + data_[i] + "\n";
        //  ext.push((runGetMaqID(datas[i])))
        cp++
    }
    /*samples += "extensions : \n";
    for (j = 0; j < extension_.length; j++) {
        samples += "    extension_" + cj + " : " + extension_[j] + "\n";
        //  ext.push((runGetMaqID(datas[i])))
        cj++
    }*/
    samples += "ENVS:\n";
    samples += "    SNK_ENV : source activate snakemake\n";
    samples += "    home : " + require('path').resolve(__dirname, '..');
    console.log(samples);
    runYamlFile(samples);
    genFile("./controllers/fastqc_snk/Snakefile", "./uploads/res/fastq")
    runSnakefile(res);
}
function extract_excel() {
    sample = ''
    CSVToJSON().fromFile('console.csv')
        .then(users => {
            for (seps of users) {
                console.log(seps.file)
                if (seps.file.indexOf('Host_mapped') != -1) {
                    Host_mapped.push({ 'name': seps.file.split('/')[3], 'num_seq': seps.num_seqs })
                }
                if (seps.file.indexOf('Patho_mapped') != -1) {
                    Patho_mapped.push({ 'name': seps.file.split('/')[3], 'num_seq': seps.num_seqs })
                }
                if (seps.file.indexOf('Patho_unmapped') != -1) {
                    Patho_unmapped.push({ 'name': seps.file.split('/')[3], 'num_seq': seps.num_seqs })
                }
                if (seps.file.indexOf('Host_mapped') == -1 && seps.file.indexOf('Patho_mapped') == -1 && seps.file.indexOf('Patho_unmapped') == -1) {
                    sample_data.push({ 'name': seps.file.split('/')[3], 'num_seq': seps.num_seqs })
                }
            }
            console.log(sample_data, Host_mapped, Patho_mapped, Patho_unmapped)

            // Create a new instance of a Workbook class
            var workbook = new excel.Workbook();
            // Add Worksheets to the workbook
            var worksheet = workbook.addWorksheet('Sheet 1');
            // var worksheet2 = workbook.addWorksheet('Sheet 2');

            // Create a reusable style
            var style = workbook.createStyle({
                font: {
                    color: '#FF0800',
                    size: 12
                },
                numberFormat: '$#,##0.00; ($#,##0.00); -'
            });

            worksheet.cell(1, 1).string('Name').style(style);
            worksheet.cell(1, 2).string('Samples').style(style);
            worksheet.cell(1, 3).string('Host_mapped').style(style);
            worksheet.cell(1, 4).string('Patho_mapped').style(style);
            worksheet.cell(1, 5).string('Patho_unmapped').style(style);
            //   worksheet.cell(2, 1).string('Num Seqs').style(style);
            // Set value of cell A3 to true as a boolean type styled with paramaters of style but with an adjustment to the font size.
            // worksheet.cell(3, 1).bool(true).style(style).style({ font: { size: 14 } });

            i = 2;
            for (seps of sample_data) {
                worksheet.cell(i, 1).string(seps.name).style(style);
                worksheet.cell(i, 2).string(seps.num_seq).style(style);
                i++;
            }
            i = 3;
            for (seps of Host_mapped) {
                worksheet.cell(i, 3).string(seps.num_seq).style(style);
                i++;
            }
            i = 3;
            for (seps of Patho_mapped) {
                worksheet.cell(i, 4).string(seps.num_seq).style(style);
                i++;
            }
            i = 3;
            for (seps of Patho_unmapped) {
                worksheet.cell(i, 5).string(seps.num_seq).style(style);
                i++;
            }
            i = 0
            workbook.write('Excel.xlsx');
        }).catch(err => {
            console.log(err);
        });
}
const runseqkit = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    var myData = []
    var myData_ = []
    tab = []
    sample_data = []
    Host_mapped = []
    Patho_mapped = []
    Patho_unmapped = []
    let samples = '' // += 
    var conda_path = '~/miniconda3/etc/profile.d/conda.sh'
    var commands = [
        conda_path,
        conda_path + ' init',
        conda_path + ' activate snakemake',
        '~/miniconda3/condabin/conda run -v -n snakemake snakemake --cores all',
    ]
    exec('cp ./controllers/seqkit_snk/Snakefile .', (err, stdout, stderr) => {
        if (err) {
            console.log(err)
            runLog('Error ')
        } else {
            var spawn_ = spawn(commands.join('&'), { shell: true });
            spawn_.stdout.on('data', function (data) {
                //do something
                console.log('stdout', data.toString())
                samples += data.toString()
            });
            spawn_.stderr.on('data', function (data) {
                //do something
                console.log('stderr', data.toString())
                samples += data.toString()
            });
            spawn_.on('exit', function (code) {
                console.log('on', code)
                runLog(samples)
                if (code == 0) {
                    extract_excel()
                    var workbook = XLSX.readFile('Excel.xlsx');
                    var sheet_name_list = workbook.SheetNames;
                    sheet_name_list.forEach(function (y) {
                        var worksheet = workbook.Sheets[y];
                        var headers = {};
                        var data = [];
                        for (z in worksheet) {
                            if (z[0] === '!') continue;
                            //parse out the column, row, and value
                            var tt = 0;
                            for (var i = 0; i < z.length; i++) {
                                if (!isNaN(z[i])) {
                                    tt = i;
                                    break;
                                }
                            };
                            var col = z.substring(0, tt);
                            var row = parseInt(z.substring(tt));
                            var value = worksheet[z].v;

                            //store header names
                            if (row == 1 && value) {
                                headers[col] = value;
                                continue;
                            }

                            if (!data[row]) data[row] = {};
                            data[row][headers[col]] = value;
                        }
                        data.shift();
                        data.shift();
                        myData = data

                    });
                    for (var attributename in myData) {
                        //  console.log(attributename + ": " + myData[attributename].Name);
                        myData_.push({
                            "name": myData[attributename].Name,
                            "read": myData[attributename].Samples,
                            "Host_mapped": ((myData[attributename].Host_mapped)),
                            "Patho_mapped": ((myData[attributename].Patho_mapped)),
                            "Patho_unmapped": ((myData[attributename].Patho_unmapped)),
                        })
                    }
                    exec('cp ./controllers/seqkit_snk/Snakefile_ Snakefile', (err, stdout, stderr) => {
                        if (err) {
                            console.log(err)
                            runLog('Error ')
                        } else {
                            var spawn_ = spawn(commands.join('&'), { shell: true });
                            spawn_.stdout.on('data', function (data) {
                                //do something
                                console.log('stdout', data.toString())
                                samples += data.toString()
                            });
                            spawn_.stderr.on('data', function (data) {
                                //do something
                                console.log('stderr', data.toString())
                                samples += data.toString()
                            });
                            spawn_.on('exit', function (code) {
                                console.log('on', code)
                                exec('zip ./uploads/graph.zip ./uploads/res/img/*', (err, stdout, stderr) => {
                                    if (err) {
                                        console.log(err)
                                        runLog('Error ')
                                    } else {

                                    }
                                });
                            });
                        }
                    });
                    console.log('stats ', myData_);
                    res.write(JSON.stringify(myData_));
                    res.end();
                } else {
                    unLock()
                    res.write('KO');
                    res.end();
                }
            });
        }

    });

}
const runQc = (req, res) => {
    // console.log(req.body);
    var data_ = identifyPairend("./uploads/data").sample
    var extension_ = identifyPairend("./uploads/data").extension


    console.log(parameters.getForConda(req.body.parameter).trim_front1)

    let samples = "samples : \n";
    var cp = 1;
    var cj = 1;
    for (i = 0; i < data_.length; i++) {
        samples += "    sample_" + cp + " : " + data_[i] + "\n";
        cp++
    }
    samples += "extensions : \n";
    for (i = 0; i < extension_.length; i++) {
        samples += "    extension_" + cj + " : " + extension_[i] + "\n";
        cj++
    }
    samples += "parameter:\n";
    samples += "    trim_front1 : " + parameters.getForConda(req.body.parameter).trim_front1 + "\n";
    samples += "    trim_front2 : " + parameters.getForConda(req.body.parameter).trim_front2 + "\n";
    samples += "    trim_tail1 : " + parameters.getForConda(req.body.parameter).trim_tail1 + "\n";
    samples += "    trim_tail2 : " + parameters.getForConda(req.body.parameter).trim_tail2 + "\n";
    samples += "    n_base_limit : " + parameters.getForConda(req.body.parameter).n_base_limit + "\n";
    samples += "    max_lg : " + parameters.getForConda(req.body.parameter).max_lg + "\n";
    samples += "    max_ql : " + parameters.getForConda(req.body.parameter).max_ql + "\n";
    samples += "ENVS:\n";
    samples += "    SNK_ENV : source activate snakemake\n";
    samples += "    home : " + require('path').resolve(__dirname, '..');
    console.log(samples);
    runYamlFile(samples);
    genFile("./controllers/qc_snk/Snakefile", "./uploads/res/qc")
    runSnakefile(res);
}
const runDbsub = (req, res) => {
    var data_ = identifyPairend("./uploads/res/qc").sample
    var extension_ = identifyPairend("./uploads/res/qc").extension

    let samples = "samples : \n";
    var cp = 1;
    var cj = 1;
    for (i = 0; i < data_.length; i++) {
        samples += "    sample_" + cp + " : " + data_[i] + "\n";
        cp++
    }
    samples += "extensions : \n";
    for (i = 0; i < extension_.length; i++) {
        samples += "    extension_" + cj + " : " + extension_[i] + "\n";
        cj++
    }

    samples += "references:\n";
    samples += "    human: " + req.body.human + "\n";
    samples += "    parasite: " + req.body.parasite + "\n";
    samples += "    quality: " + req.body.qualtiy + "\n";
    samples += "ENVS:\n";
    samples += "    SNK_ENV : source activate snakemake\n";
    samples += "    home : " + require('path').resolve(__dirname, '..');
    console.log(samples);
    runYamlFile(samples);
    genFile("./controllers/double_sb_snk/Snakefile", "./uploads/res/dbsub")
    runSnakefile(res);
}


const runGenCons3 = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    dirPath = 'uploads/res/cons/references'
    var conda_path = '~/miniconda3/etc/profile.d/conda.sh'
    var data_ = identifyPairend("./uploads/res/dbsub").sample
    fs.readdir(dirPath, function (err, files) {
        for (i = 0; i < data_.length; i++) {
            for (j = 0; j < files.length; j++) {
                var commands = [
                    conda_path,
                    conda_path + ' init',
                    conda_path + ' activate snakemake',
                    '~/miniconda3/condabin/conda run -v -n snakemake minimap2 --secondary=no -a uploads/res/cons/references/' + files[j] + " uploads/res/cons/" + data_[i] + "/contig/final.contigs.fa -o uploads/res/cons/" + data_[i] + "/sam/" + files[j] + ".sam",
                ]
                exec(commands.join(' & '), function (error, stdout, stderr) {
                    if (error) {
                        res.write('KO');
                        res.end();
                        console.error(`exec error: ${error}`);
                        return;
                    } else {
                        res.write('OK');
                        res.end();
                        console.log(`exec out: ${stdout}`);
                        console.log(`exec err: ${stderr}`);
                    }
                }
                );
            }
        }

    })
}

const runGenCons4 = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    var data_ = identifyPairend("./uploads/res/dbsub").sample
    var conda_path = '~/miniconda3/etc/profile.d/conda.sh'
    for (i = 0; i < data_.length; i++) {
        dirPath = 'uploads/res/cons/' + data_[i]
        fs.readdir(dirPath + '/sam', function (err, files) {
            for (j = 0; j < files.length; j++) {
                var commands = [
                    conda_path,
                    conda_path + ' init',
                    conda_path + ' activate snakemake',
                    '~/miniconda3/condabin/conda run -v -n snakemake samtools view -S -h -b ' + dirPath + '/sam/' + files[j] + ' | samtools sort > ' + dirPath + '/bam/' + files[j] + '.bam && samtools index ' + dirPath + '/bam/' + files[j] + '.bam',
                ]
                exec(commands.join(' & '), function (error, stdout, stderr) {
                    if (error) {
                        res.write('KO');
                        res.end();
                        console.error(`exec error: ${error}`);
                        return;
                    } else {
                        res.write('OK');
                        res.end();
                        console.log(`exec out: ${stdout}`);
                        console.log(`exec err: ${stderr}`);
                    }
                    //res.end();
                }
                );
            }
        })


    }

}

const runGenCons5 = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    var conda_path = '~/miniconda3/etc/profile.d/conda.sh'
    dirPath = 'uploads/res/cons/references'
    fs.readdir(dirPath, function (err, files) {
        var data_ = identifyPairend("./uploads/res/dbsub").sample
        for (i = 0; i < data_.length; i++) {
            for (j = 0; j < files.length; j++) {
                var commands = [
                    conda_path,
                    conda_path + ' init',
                    conda_path + ' activate snakemake',
                    '~/miniconda3/condabin/conda run -v -n snakemake bcftools mpileup -f ' + dirPath + '/' + files[j] + ' uploads/res/cons/' + data_[i] + '/bam/' + files[j] + '.sam.bam | bcftools call --ploidy 1 -cv -o uploads/res/cons/' + data_[i] + '/vcf/' + files[j] + '.sam.bam.vcf',
                ]
                exec(commands.join(' & '), function (error, stdout, stderr) {
                    if (error) {
                        res.write('KO');
                        res.end();
                        console.error(`exec error: ${error}`);
                        return;
                    } else {
                        res.write('OK');
                        res.end();
                        console.log(`exec out: ${stdout}`);
                        console.log(`exec err: ${stderr}`);
                    }
                    //res.end();
                }
                );
            }
        }
    })
}

const runGenCons = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    var data_ = identifyPairend("./uploads/res/dbsub").sample
    for (i = 0; i < data_.length; i++) {
        exec("cat uploads/res/cons/" + data_[i] + "/cons/*.fasta >> uploads/res/cons/res/" + data_[i] + ".fasta", (err, stdout, stderr) => {
            if (err) {
                console.error(`err error: ${err}`);
                return;
            } else {
                console.log(`exec out: ${stdout}`);
                console.log(`exec err: ${stderr}`);
            }
        })
    }
    res.write('OK');
    res.end();
}

const runGenCons1 = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    var data_ = identifyPairend("./uploads/res/dbsub").sample
    refpatho = 'uploads/references/parasite/' + req.body.firstCtrl
    console.log(req.body, ' Generate')
    exec("rm -fr uploads/res/dbsub/*.*am* uploads/res/dbsub/*Host* uploads/res/dbsub/*Unmapped*", (err, stdout, stderr) => {
        var conda_path = '~/miniconda3/etc/profile.d/conda.sh'
        if (err) {
        } else {
            var commands = [
                conda_path,
                conda_path + " init",
                conda_path + " activate snakemake",
                "~/miniconda3/condabin/conda run -v -n snakemake grep -c '>' " + refpatho + " | seqkit split " + refpatho + " -i",
            ]
            exec(commands.join(' & '), function (error, stdout, stderr) {
                if (error) {
                    res.write('KO');
                    res.end();
                    console.error(`exec error: ${error}`);
                    return;
                } else {
                    exec("mkdir -p uploads/res/cons/references && mv " + refpatho + ".split/* uploads/res/cons/references/", (err, stdout, stderr) => {
                        if (err) {
                            res.write('KO');
                            //res.end();
                            console.error(`err error: ${err}`);
                            return;
                        } else {
                            res.write('OK');
                            //res.end();
                            console.log(`exec out: ${stdout}`);
                            console.log(`exec err: ${stderr}`);
                        }
                        res.end();
                    })
                }
            })
        }
    })


    for (i = 0; i < data_.length; i++) {
        exec("rm -fr uploads/res/cons && mkdir -p uploads/res/cons/" + data_[i] + "/cons uploads/res/cons/" + data_[i] + "/sam uploads/res/cons/" + data_[i] + "/bam uploads/res/cons/" + data_[i] + "/vcf", (err, stdout, stderr) => {
            if (err) {
                console.error(`err error: ${err}`);
                return;
            } else {
                console.log(`exec out: ${stdout}`);
                console.log(`exec err: ${stderr}`);
            }
        })
    }

}

const runGenCons2 = (req, res) => {
   // console.log(req.body)
    var dirPath = 'uploads/res/cons/references' + '|' + req.body.depth + '|' + req.body.quality
  //  console.log(req.body,dirPath)
    fs.readdir(dirPath.split("|")[0], function (err, files) {
        let samples = ""
        var patho = files
        var data_ = identifyPairend("./uploads/res/dbsub").sample
        if (err) {
            return err;
        } else {
            samples += "parametres:\n";
            samples += "    depth: " + dirPath.split("|")[1] + "\n";
            samples += "    quality: " + dirPath.split("|")[2] + "\n";
            samples += "samples : \n";
            for (i = 0; i < data_.length; i++) {
                samples += "    sample_" + i + " : " + data_[i] + "\n";
            }
            samples += "references_eclate:\n";
            for (i = 0; i < patho.length; i++) {
                samples += "    patho_" + i + " : " + patho[i] + "\n";
            }
            samples += "ENVS:\n";
            samples += "    SNK_ENV : source activate snakemake\n";
            samples += "    home : " + require('path').resolve(__dirname, '..');
        }
        console.log(samples);
        runYamlFile(samples);
        genFile("./controllers/consensus_snk/Snakefile", "./uploads/res/cons/res/")
        runSnakefile(res);
    })
}
const rerunDbsub = (req, res) => {
    console.log(req.body)
    var data_ = identifyPairend("./uploads/dbsub").sample
    var extension_ = identifyPairend("./uploads/dbsub").extension

    let samples = "samples : \n";
    var cp = 1;
    var cj = 1;
    for (i = 0; i < data_.length; i++) {
        samples += "    sample_" + cp + " : " + data_[i] + "\n";
        cp++
    }
    samples += "extensions : \n";
    for (i = 0; i < extension_.length; i++) {
        samples += "    extension_" + cj + " : " + extension_[i] + "\n";
        cj++
    }
    samples += "references:\n";
    samples += "    human: " + req.body.ngs.human + "\n";
    samples += "    parasite: " + req.body.ngs.parasite + "\n";
    samples += "ENVS:\n";
    samples += "    SNK_ENV : source activate snakemake\n";
    samples += "    home : " + require('path').resolve(__dirname, '..');
    console.log(samples);
    runYamlFile(samples);
    genFile("./controllers/redouble_sb_snk/Snakefile", "./uploads/res/dbsub")
    runSnakefile(res);

}
const runPipe = (req, res) => {
    var data_ = identifyPairend("./uploads/data").sample
    var extension_ = identifyPairend("./uploads/data").extension


    console.log(parameters.getForConda(req.body.parameter).trim_front1)

    let samples = "samples : \n";
    var cp = 1;
    var cj = 1;
    for (i = 0; i < data_.length; i++) {
        samples += "    sample_" + cp + " : " + data_[i] + "\n";
        cp++
    }
    samples += "extensions : \n";
    for (i = 0; i < extension_.length; i++) {
        samples += "    extension_" + cj + " : " + extension_[i] + "\n";
        cj++
    }
    samples += "references:\n";
    samples += "    human: " + req.body.human + "\n";
    samples += "    parasite: " + req.body.parasite + "\n";
    samples += "    quality: " + req.body.qualtiy + "\n";
    samples += "parameter:\n";
    samples += "    trim_front1 : " + parameters.getForConda(req.body.parameter).trim_front1 + "\n";
    samples += "    trim_front2 : " + parameters.getForConda(req.body.parameter).trim_front2 + "\n";
    samples += "    trim_tail1 : " + parameters.getForConda(req.body.parameter).trim_tail1 + "\n";
    samples += "    trim_tail2 : " + parameters.getForConda(req.body.parameter).trim_tail2 + "\n";
    samples += "    n_base_limit : " + parameters.getForConda(req.body.parameter).n_base_limit + "\n";
    samples += "    max_lg : " + parameters.getForConda(req.body.parameter).max_lg + "\n";
    samples += "    max_ql : " + parameters.getForConda(req.body.parameter).max_ql + "\n";
    samples += "ENVS:\n";
    samples += "    SNK_ENV : source activate snakemake\n";
    samples += "    home : " + require('path').resolve(__dirname, '..');
    console.log(samples);
    runYamlFile(samples);
    genFile("./controllers/pipeline_snk/Snakefile", "./uploads/res/qc ./uploads/res/dbsub ./uploads/res/cons")
    runSnakefile(res);
}
const runSnp = (req, res) => {

    console.log(req.body);
    var cp = 1;
    var end;
    var maq = [];
    let datas = req.body.data.data;
    let samples = req.body.data.datatype + ": \n";
    if (checkGenome("ref/3D7/" + req.body.data.dataparasite) != "OK") {
        res.setHeader('Content-Type', 'application/json');
        res.write(JSON.stringify({
            log: 'Indexed Data Genome Before  to Filter'
        }));
        res.end();
    } else {
        if (req.body.data.datatype = "samples_p") {
            end = "paire"
        } else {
            end = "single"
        }
        for (i = 0; i < datas.length; i++) {

            samples += "    sample_" + cp + " : " + datas[i] + "\n";
            maq.push(runGetMaqID(datas[i]))
            cp++
        }
        var ex = 1;
        let extensions = runGetExtension(datas);
        samples += "extensions : \n";
        for (i = 0; i < extensions.length; i++) {

            samples += "    extension_" + ex + " : " + extensions[i] + "\n";
            ex++
        }
        var mq = 1;
        samples += "maq : \n";
        for (i = 0; i < maq.length; i++) {

            samples += "    maq_" + mq + " : " + maq[i] + "\n";
            mq++
        }
        samples += "parameter:\n";
        samples += "    threads: " + req.body.data.threads + "\n";
        // samples += "    id: " + req.body.data.id + "\n";
        samples += "    end: " + end + "\n";
        samples += "genome:\n";
        samples += "    parasite: " + req.body.data.dataparasite + "\n";
        samples += "ENVS:\n";
        samples += "    SNK_ENV: source activate snakemake";
        console.log(samples);
        runYamlFile(samples);
        runSnakefile("snakefile_snp", req.body.data.threads, res);
    }

}
const runIndexh = (req, res) => {

    var cp = 1;
    console.log(req.body.data)
    let datas = req.body.data;
    let samples = "ENVS:\n";
    samples += "    SNK_ENV : source activate snakemake\n";
    samples += "    home : " + require('path').resolve(__dirname, '..') + "\n";
    samples += "samples:\n";
    for (i = 0; i < datas.length; i++) {
        samples += "    indexh_" + cp + " : " + datas[i] + "\n";
        cp++
    }
    console.log(samples);
    runYamlFile(samples);
    genFile("./controllers/indexh_snk/Snakefile", "./uploads/references/human")
    runSnakefile(res);

    /*
    runSnakefile("./controllers/indexh_snk/", "./uploads/references/human", res);
    */
}
const runIndexp = (req, res) => {
    var cp = 1;
    console.log(req.body.data)
    let datas = req.body.data;
    let samples = "ENVS:\n";
    samples += "    SNK_ENV : source activate snakemake\n";
    samples += "    home : " + require('path').resolve(__dirname, '..') + "\n";
    samples += "samples:\n";
    for (i = 0; i < datas.length; i++) {
        samples += "    indexp_" + cp + " : " + datas[i] + "\n";
        cp++
    }
    console.log(samples);
    runYamlFile(samples);
    genFile("./controllers/indexp_snk/Snakefile", "./uploads/references/parasite")
    runSnakefile(res);

    /*
        runYamlFile(samples);
        runSnakefile("./controllers/indexp_snk/", "./uploads/references/parasite", res);
    */
}
const downloadFile = (req, res) => {
    var id = req.params.data;
    console.log('Download : ' + id.split("-").join("/"));
    res.download(id.split("-").join("/"));
}
const deleteFile = (req, res) => {
    var id = req.params.data;

    var id = req.params.data;


    repertory = 'res/' + id.split("-").join("/");

    fs.readdir(repertory, (err, files) => {
        if (err) throw err;

        for (const file of files) {

            fs.unlink(path.join(repertory, file), err => {
                if (err) {
                    throw err;
                } else {
                    //  res.redirect(req.get('referer'));
                }
            });

        }
        res.redirect(req.get('referer'));
    });

}
module.exports = {
    getData,
    getTreads,
    getGenomHuman,
    getGenomParasite,
    runFastqc,
    runQc,
    runDbsub,
    rerunDbsub,
    runGenCons,
    runGenCons1,
    runGenCons2,
    runGenCons3,
    runGenCons4,
    runGenCons5,
    runPipe,
    checkGenome,
    runIndexh,
    runIndexp,
    downloadFile,
    deleteFile,
    runSnp,
    runseqkit
}