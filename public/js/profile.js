const path = window.location.pathname; 
const segments = path.split('/');
const userId = segments[segments.length - 1];
console.log('browser id',userId); 
function getSpecUserProfile(userId) {
  $.ajax({
    url: '/getUserSpecInfoData',
    type: 'GET',
    data: { userId },
    dataType: 'json',
    success(res) {
        if(res.success){
            const responseData = res.data;
            $('#profileImg').attr('src', responseData.image);
            $('#profileBio').text(responseData.bio);
            $('#profileName').html(
                                `${responseData.name} <span id="profileAge">${responseData.age ? ', '+ responseData.age : ''}</span>`
                                );
            $('#onlineStatus').html(`${responseData.is_online==1 ? '<span class="online"></span>'+'Online Now' : 'Offline'}`);

        }
    }
  });
}
$(document).ready(function(){
    if(userId!='profile'){
      getSpecUserProfile(userId);
    }
});

//script for update profile page
const mainImg = document.getElementById('mainImg');
const thumbs = document.getElementById('thumbs');
const photosInput = document.getElementById('photos');

photosInput.addEventListener('change', function () {
  thumbs.innerHTML = '';

  const files = Array.from(this.files);

  if (files.length > 0) {
    mainImg.src = URL.createObjectURL(files[0]);
  }

  files.forEach((file, index) => {
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);

    img.addEventListener('click', () => {
      mainImg.src = img.src;
    });

    thumbs.appendChild(img);
  });
});

//code for profile js
$(document).on('click', '#saveProfile', function(e) {
  e.preventDefault();
  
  const form = $('#profileForm')[0];
  const userFormData = new FormData(form);
  console.log([...userFormData.entries()]);
  $.ajax({
    url:'updateProfile',
    type:'post',
    processData: false, 
    contentType: false,
    data:userFormData,
    success:function(response){
      console.log('user form response',userFormData);
    },
    error:function(error){

    }
  })
});
