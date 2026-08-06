function getAllUsers() {
    $.ajax({
        type: 'POST',              
        url: 'loadMatchesTem',    
        success: function(response) {
            console.log('get users',response); 
        },
        error: function(error) {
            console.log(error);    
        }
    });
}

$(document).ready(function(){
      //getAllUsers();
});
