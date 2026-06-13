const l={all:["rooms"],lists:()=>[...l.all,"list"],list:s=>[...l.lists(),s],details:()=>[...l.all,"detail"],detail:s=>[...l.details(),s]};export{l as r};
