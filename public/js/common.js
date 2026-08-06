function getNotification()
    {
        $.ajax({
            url:'getCountNotification',
            type:'get',
            success:function(response){
                if(response.statusCode==200){
                    $('#countNotify').text(response.notificationCount);
                }
            },
            error:function(error){
            }
        });
    }
getNotification();


//second option for show address suggesstions
const ACCESS = "pk.730d12ad2b022ddf7061d435502bbc12";
let debounce, lastData = [];

$("#locationInput").on("input", function () {
    clearTimeout(debounce);
    let q = $(this).val().trim();

    if (q.length < 2) {
        $("#locationSuggestions").hide();
        return;
    }

    debounce = setTimeout(() => {
        $.get(`https://us1.locationiq.com/v1/autocomplete?key=${ACCESS}&q=${q}`, function (data) {

            lastData = data;
            let html = "";

            data.forEach((item, i) => {
                html += `<div class="suggest-item" data-i="${i}">${item.display_name}</div>`;
            });
                
            $("#locationSuggestions").html(html).show();
        });
    }, 500);
});

$(document).on("click", ".suggest-item", function () {
    const d = lastData[$(this).data("i")];
    
    $("#locationInput").val(d.display_name);
    $("#locationSuggestions").hide();
    console.log("Latitude:", d.lat);
    console.log("Longitude:", d.lon);
    $('#latitude').val(d.lat);
    $('#longitude').val(d.lon);

});

//to hide show sidebar 
const menuToggle = document.querySelector('.menu-toggle');
const sidebar = document.querySelector('.sidebar');
menuToggle.addEventListener('click', (e) => {
    e.stopPropagation(); 
    sidebar.classList.toggle('sidebar-open');
});
//end to hide show sidebar 
