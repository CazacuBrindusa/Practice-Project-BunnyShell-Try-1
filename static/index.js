document.addEventListener("DOMContentLoaded", () => {
    const dropArea = document.getElementById("drop-area");
    const jsonFileInput1 = document.getElementById("json-file-input1");
    const jsonFileInput2 = document.getElementById("json-file-input2");
    const convertBtn = document.getElementById("convert-btn");
    const resultContainer = document.getElementById("result-container");
    const dropMessage = document.getElementById("drop-message");

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });

    dropArea.addEventListener('drop', handleDrop, false);
    jsonFileInput1.addEventListener('change', () => handleFiles(jsonFileInput1.files), false);
    jsonFileInput2.addEventListener('change', () => handleFiles(jsonFileInput2.files), false);
    convertBtn.addEventListener('click', convertToJson, false);

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function highlight() {
        dropArea.classList.add('highlight');
    }

    function unhighlight() {
        dropArea.classList.remove('highlight');
    }

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    function handleFiles(files) {
        const fileList = [...files];
        const validFiles = fileList.filter(file => file.type === "application/json");

        if (validFiles.length > 0) {
            dropMessage.style.display = 'none';
        } else {
            alert('Please select a JSON file.');
            return;
        }

        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = function (e) {
                const content = e.target.result;
                displayFileContent(content);
            }
            reader.readAsText(file);
        });
    }

    function displayFileContent(content) {
        resultContainer.innerText = content;
    }

    async function convertToJson() {
        const formData = new FormData();
        const files1 = jsonFileInput1.files;
        const files2 = jsonFileInput2.files;

        if (files1.length === 0 || files2.length === 0) {
            alert('Please select two files to convert.');
            return;
        }

        formData.append('file1', files1[0]);
        formData.append('file2', files2[0]);

        try {
            const response = await fetch('/convert', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Conversion failed');
            }

            const result = await response.json();
            if (result.file1 && result.file2) {
                const link1 = document.createElement('a');
                link1.href = result.file1;
                link1.download = result.file1.split('/').pop();
                link1.click();

                const link2 = document.createElement('a');
                link2.href = result.file2;
                link2.download = result.file2.split('/').pop();
                link2.click();
            } else {
                throw new Error('Failed to get download links');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to convert file.');
        }
    }
});
