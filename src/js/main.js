window.onload = function() {
  handleAuth()
  renderChatRooms()
  clearModal()
  createChatRoom()
  newRoomCreated()
  $('#tag-badges').tagsinput({
    confirmKeys: [13, 32, 44],
    allowDuplicates: true
  })
}

function handleAuth() {
  $('#login').click(function() {
    $('#authentication').modal('show')
  })
  $('#signIn').click(function() {
    $('#emailHelp').hide()
    $('#emailInvalid').hide()
    $('#passwordHelp').hide()
    auth.signInWithEmailAndPassword($('#email').val(), $('#password').val())
    .catch(function(err) {
      if (err.code == "auth/wrong-password") {
        $('#passwordHelp').show()
      } else if (err.code == "auth/user-not-found") {
        $('#emailHelp').show()
      } else if (err.code == "auth/invalid-email") {
        $('#emailInvalid').show()
      }
    })
  })
  $('#signUp').click(function() {
    $('#emailHelp').hide()
    $('#emailInvalid').hide()
    $('#passwordHelp').hide()
    auth.createUserWithEmailAndPassword($('#email').val(), $('#password').val())
    .catch(function(err) {
      if (err.code == "auth/email-already-in-use") {
        auth.signInWithEmailAndPassword($('#email').val(), $('#password').val())
      } else if (err.code == "auth/invalid-email") {
        $('#emailInvalid').show()
      }
    })
  })
  $('#googleSignIn').click(function(e) {
    e.preventDefault()
    auth.createUserWithEmailAndPassword($('#email').val(), $('#password').val())
    .then(function(res) {
      console.log(res)
    })
    .catch(function(err) {
      console.log(err)
    })
  })
  auth.onAuthStateChanged(function(user) {
    if (user) {
      clearModal()
      $('#authentication').modal('hide')
      user.photoURL && $('#avatar').attr('src', user.photoURL)
      $('#avatar').show()
      $('#logout').show()
      $('#new-room').show()
      $('#login').hide()
    } else {
      $('#login').show()
      $('#avatar').hide()
      $('#logout').hide()
      $('#new-room').hide()
    }
  })
  $('#logout').click(function() {
    firebase.auth().signOut()
  })
}

function newRoomCreated() {
  db.collection('rooms').onSnapshot(function(snap) {
    renderChatRooms()
  })
}

function clearModal() {
  $('.modal').on('hidden.bs.modal', function() {
    $('#emailHelp').hide()
    $('#emailInvalid').hide()
    $('#passwordHelp').hide()
    $('#email').val('')
    $('#password').val('')
    $('#room-title').val('')
    $('#tag-badges').tagsinput('removeAll')
  })
}

function createChatRoom() {
  $('#create-chat-room').click(function() {
    db.collection('rooms').add({
      title: $('#room-title').val(),
      hashtags: $("#tag-badges").tagsinput('items'),
      users: 1,
      comments: 0
    })
    clearModal()
    $('#create-room').modal('hide')
  })
}

function renderChatRooms() {
  const chatrooms = $('#chatrooms').empty()
  db.collection('rooms').get().then(function(snap) {
    snap.forEach(function(doc) {
      let hashtags = []
      for (let j=0; j<doc.data().hashtags.length; j++) {
        hashtags.push(`<a href="#">#${doc.data().hashtags[j]}</a>`)
      }
      hashtags = hashtags.join(" ")
      $( "#chatrooms" ).append(`
        <div class="col-lg-3 col-md-4 col-sm-6 col-12">
          <div class="card my-2">
            <div class="card-body">
              <h5 class="card-title">${doc.data().title}</h5>
              <p class="card-text">${hashtags}</p>
              <div>
                <span>${doc.data().users.length}</span>
                <i class="fa fa-user mr-2"></i>
                <span>${doc.data().comments.length}</span>
                <i class="fa fa-commenting"></i>
              </div>
            </div>
          </div>
        <div>
      `)
    })
  })
}
