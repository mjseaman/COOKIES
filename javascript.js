//Batch (Model)
function Batch(options) {

  var self = this;
  self.cooked = 0;
  self.cookieType = options.cookieType;
  self.bakeTime = options.bakeTime;
}

Batch.prototype = {

  bake: function(time) {
    this.cooked += time;
  },

  status: function() {
    console.log("called status on batch");
    if (this.cooked < this.bakeTime) {
      return "Still Gooey";
    }
    else if (this.cooked == this.bakeTime) {
      return "Just Right";
    }
    else {
      return "Burnt SHIT";
    }
  }
}

//BatchView
function BatchView(batch) {
  var self = this;
  self.batch = batch;
}

//BatchView.prototype
BatchView.prototype.render = function(){
  console.log("called batch render");
    return (self.batch.cookieType + " (" + self.batch.status() + ")");
  }

//PrepTable (Model)
function PrepTable() {
  this.batches = [];
}

//PrepTable (Prototype)
PrepTable.prototype = {
  addBatch: function(batch) {
    this.batches.push(batch);
    $(this).trigger('changed', this);
    console.log("prepTable batches********")
    console.log(this.batches);
  },
  prepBatch: function(batch) {
    $(this).trigger('batchPrepped', batch);
  },
  removeBatch: function(batch) {
    this.batches = _.without(this.batches,batch);
    $(this).trigger('changed', this);
    console.log("prepTable batches********")
    console.log(this.batches);
  }
}

// PrepTableView
function PrepTableView(prepTable) {
  var self = this;
  self.prepTable = prepTable;
  $(prepTable).on('changed', function(e) {
    self.render();
  });
}

PrepTableView.prototype = {
  render: function() {
    $("#prep_batches").empty();
    var self = this;
    _.each(self.prepTable.batches, function(batch) {
      var batchView = new PrepTableBatchView(batch, self.prepTable);
      $('#prep_batches').append(batchView.$element);
    });
  },
};

function PrepTableBatchView(batch, prepTable) {
  this.$element = $(this.template());
  this.$element.find('span').text(batch.cookieType);
  this.$element.on('click', 'button', function() {
    prepTable.prepBatch(batch);
  });
}

PrepTableBatchView.prototype.template = function() {
  return $.trim($('#prep_table_batch').html());
};

//Oven (Model)
function Oven(options) {
  this.batches = [];
}

//Oven.prototype
Oven.prototype = {
  addBatch: function(batch) {
    this.batches.push(batch);
    $(this).trigger('changed', batch);
  },

  removeBatch: function(batch) {
    this.batches = _.without(this.batches,batch);
    $(this).trigger('changed', batch);
  },

  bake: function(time) {
    _.each(this.batches,function(batch) {
      batch.bake(time);
      console.log(batch.cooked);
    });
    $(this).trigger('changed', batch);
  }
}

//OvenView
function OvenView(oven) {
  this.oven = oven;
  var self = this;
  $(this.oven).on('changed', function() {
      self.render();
  });
  $('#bake').on('click', function(e) {
    e.preventDefault();
    self.oven.bake(1);
  });
}

//OvenView.prototype
OvenView.prototype = {
  render: function() {
    console.log("called oven render");
    var self = this;
    for (var i in self.oven.batches) {
      var $oven = self.ovenElement();
      var $rack = $oven.find("#rack_"+ i);
      batchView = new BatchView();
      $rack.text(batchView.render(self.oven.batches[i]));
    }

  },
  ovenElement: function(){
    return $("#oven");
  }
}

//Baker (Controller)
function Baker(options) {

  var self = this;
  this.batches = [];

  initialize = function(options) {
    self.prepTable = new PrepTable();
    self.prepTableView = new PrepTableView(self.prepTable);

    self.oven = new Oven();
    self.ovenView = new OvenView(self.oven);

    $('#new_batch').on('submit', function(e) {
      e.preventDefault();
      var form = this;
      self.prepTable.addBatch(self.createBatch(form));
    });
    
    $(self.prepTable).on('batchPrepped', function(e, batch) {
      e.preventDefault();
      self.prepTable.removeBatch(batch);
      self.oven.addBatch(batch);
    });

  }
  initialize(options);
}

Baker.prototype = {
  createBatch: function(form) {
    var cookieType = $(form).serializeArray()[0].value;
    var bakeTime = $(form).serializeArray()[1].value;
    batch = new Batch({cookieType: cookieType, bakeTime: bakeTime});

    this.batches.push(batch);
    return batch;
  }
}

$(function() {
  var baker = new Baker();
});
