export default {
    uploadFile(file) {
        return new Promise((resolve, reject) => {
            var reader = new FileReader();
            reader.onload = function() {
                const blob = reader.result;
                resolve(blob);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },
    uploadDialog() {
        var div = document.createElement("div"),
            input = document.createElement("input");

        input.setAttribute("type", "file");

        document.body.appendChild(div);
        div.appendChild(input);

        div.style.width = "0";
        div.style.height = "0";

        var ev = new MouseEvent("click", {});
        input.dispatchEvent(ev);
        //document.body.removeChild(div);
    },
    downloadBlob(blob) {
        var url = URL.createObjectURL(blob),
            div = document.createElement("div"),
            anch = document.createElement("a");

        document.body.appendChild(div);
        div.appendChild(anch);

        anch.innerHTML = "&nbsp;";
        div.style.width = "0";
        div.style.height = "0";
        anch.href = url;
        anch.download = name;

        var ev = new MouseEvent("click", {});
        anch.dispatchEvent(ev);
        document.body.removeChild(div);
    }
};
