batch = new Batch({cookieType:"Choco",bakeTime:3});
prepTable = new PrepTable();
prepTable.addBatch(batch);
prepTableView = new PrepTableView();
prepTableView.render(prepTable);
