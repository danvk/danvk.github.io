function Roster() {
  this.container = document.createElement('div');
  this.container.className = 'container';
  
  this.scroller = document.createElement('div');
  this.scroller.className = 'scroller';
  this.scroller.style.overflow = 'auto';
  this.container.appendChild(this.scroller);
}

// Users is an array of { image_url: , name: , color: } objects.
Roster.prototype.updateUsers = function(users) {
  this.scroller.innerHTML = '';

  for (var i = 0; i < users.length; i++) {
    var user = users[i];
    var div = document.createElement('div');
    div.className = 'line';

    var name = document.createElement('span');
    name.className = 'name';
    name.innerHTML = '<img width=24 height=24 src="' + user.image_url + '" /> ' + user.name;
    div.appendChild(name);

    var color_div = document.createElement('div');
    color_div.style.height = '4px';
    color_div.style.background = user.color;
    div.appendChild(color_div);

    this.scroller.appendChild(div);
  }
};
