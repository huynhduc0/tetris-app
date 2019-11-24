export default class Arena{
    constructor(w,h){
       const maxtrix = [];
       while(h--){
           maxtrix.push(new Array(w).fill(0));
       }
       this.maxtrix = maxtrix;
       this.events = new Event;
   }
   
   checkPoint(){
       let rowCount = 1;
       let score = 0;
       outer: for(let y = this.maxtrix.length-1;y>0;y--){
                   for (let x = this.maxtrix[y].length;x>0;x--){
                       if(this.maxtrix[y][x] ===0) continue outer;
                   }
       const row = this.maxtrix.splice(y,1)[0].fill(0);
       this.maxtrix.unshift(row);
       y++;
       score += rowCount*10;
       rowCount*=2;
       }
       this.events.emit('maxtrix',this.maxtrix);
       return score;
   }
   clear(){
       this.maxtrix.forEach(row => row.fill(0));
       this.events.emit('maxtrix',this.maxtrix);
   }
   merge(player){
       player.maxtrix.forEach((row,y)=>{
           row.forEach((value,x)=>{
               if (value!==0) {
                   this.maxtrix[y+player.pos.y][x+player.pos.x] = value;
               }
           })
       });
       this.events.emit('maxtrix',this.maxtrix);
   }
   collide(player){
       const [m,o] = [player.maxtrix, player.pos];
       for(let y = 0; y< m.length;y++){
           for(let x = 0; x< m[y].length;x++){
               if(m[y][x] !==0 
                   && (this.maxtrix[y+ o.y] 
                   && this.maxtrix[y+o.y][x+o.x])!==0){
                   return true;
               }
           }
       }
       return false;
   }

}