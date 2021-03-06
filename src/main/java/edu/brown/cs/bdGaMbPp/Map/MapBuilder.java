package edu.brown.cs.bdGaMbPp.Map;

import edu.brown.cs.bdGaMbPp.Collect.Pair;

import static org.junit.Assert.assertEquals;

import java.awt.Point;
import java.awt.geom.Point2D;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;
import java.util.Set;

public class MapBuilder {
	private Integer numOfRows;
	private Integer numOfCols;

	private Integer leastwall;

	public MapBuilder(){
		leastwall = 3;
		numOfRows = 16;
		numOfCols = 24;
	}

	private List<List<Location>> getMapOfWalls(){
		List<List<Location>> map = new ArrayList<List<Location>>();
		int i;
		int j;
		for(i = 0 ; i < numOfRows ; i ++){
			map.add(new ArrayList<Location>());
			for(j=0;j<numOfCols;j++){
				map.get(i).add(new UnbreakableWall());
			}
		}
		
		for(int row = 0; row < numOfRows ; row++) {
			map.get(row).set(0, new Bound());
			map.get(row).set(numOfCols-1, new Bound());
		}
		for(int col = 0; col < numOfCols ; col++) {
			map.get(0).set(col, new Bound());
			map.get(numOfRows-1).set(col, new Bound());
		}
		return map;
	}
	private boolean withProbability(double prob) {
		if(Math.random() < prob){
			return true;
		}
		return false;
	}

	public List<List<Location>> getMapAsList(double potHoleProb, double breakableWallProb){
		String upDownLeftRight = "1," + (numOfRows-1) + ",1," + (numOfCols-1) + ",horizontal";

		Queue<String> q = new LinkedList<>();
		q.add(upDownLeftRight);
		int rand;
		int rowstart;
		int rowend;
		int colstart;
		int colend;
		List<List<Location>> map = this.getMapOfWalls();
		boolean twoWide;
		List<Pair<Integer,Integer>> listOfLandCoords = new ArrayList<Pair<Integer,Integer>>();
		while(!q.isEmpty()){
			twoWide = this.withProbability(.6);
			String[] coords = q.remove().split(",");
			rowstart = Integer.parseInt(coords[0]);
			rowend = Integer.parseInt(coords[1]);
			colstart = Integer.parseInt(coords[2]);
			colend = Integer.parseInt(coords[3]);
			switch(coords[4]){
			case "horizontal":

				rand = (int)(Math.random() * (colend - colstart));
				rand += colstart;
				for(int i = rowstart; i < rowend; i ++){
					if(map.get(i).get(rand).getRepresentation().equals("u")){
						map.get(i).set(rand, new Land());
						Pair<Integer,Integer> pair = new Pair<Integer,Integer>(i, rand);
						if(!listOfLandCoords.contains(pair)){
							listOfLandCoords.add(pair);

						}
					}if(twoWide){
						if(i - 1 >= 1 && map.get(i-1).get(rand).getRepresentation().equals("u")){
							map.get(i-1).set(rand, new Land());
							Pair<Integer,Integer> pair = new Pair<Integer,Integer>(i-1,rand);
							if(!listOfLandCoords.contains(pair)) {

								listOfLandCoords.add(pair);
							}

						}else if(i + 1 < numOfRows - 1 && map.get(i+1).get(rand).getRepresentation().equals("u")){
							map.get(i+1).set(rand, new Land());
							Pair<Integer,Integer> pair = new Pair<Integer,Integer>(i+1,rand);
							if(!listOfLandCoords.contains(pair)) {
								listOfLandCoords.add(pair);
							}

						}

					}

				}
				if(rand - colstart > leastwall){
					q.add(rowstart + "," + rowend + "," + colstart + "," + rand + ",vertical");
				}
				if(colend - rand > leastwall){
					q.add(rowstart + "," + rowend + "," + rand + "," + colend + ",vertical");

				}

				break;
			case "vertical":
				rand = (int)(Math.random() * (rowend - rowstart));
				rand += rowstart;
				for(int i = colstart; i < colend; i ++){
					if(map.get(rand).get(i).getRepresentation().equals("u")){
						map.get(rand).set(i, new Land());
						Pair<Integer,Integer> pair = new Pair<Integer,Integer>(rand,i);
						if(!listOfLandCoords.contains(pair)) {
							listOfLandCoords.add(pair);

						}


					}
					if(twoWide){
						if(i-1 >= 1 && map.get(rand).get(i-1).getRepresentation().equals("u")){
							map.get(rand).set(i - 1, new Land());
							Pair<Integer,Integer> pair = new Pair<Integer,Integer>(rand,i-1);
							if(!listOfLandCoords.contains(pair)) {
								listOfLandCoords.add(pair);

							}


						}else if(i+1 < numOfCols - 1 && map.get(rand).get(i+1).getRepresentation().equals("u")){
							map.get(rand).set(i+1, new Land());
							Pair<Integer,Integer> pair = new Pair<Integer,Integer>(rand,i+1);
							if(!listOfLandCoords.contains(pair)) {
								listOfLandCoords.add(pair);

							}



						}
					}
				}
				if(rand - rowstart > leastwall){
					q.add(rowstart + "," + rand + "," + colstart + "," + colend + ",horizontal");


				}
				if(rowend - rand > leastwall){
					q.add(rand + "," + rowend + "," + colstart + "," + colend + ",horizontal");

				}
				break;
			default:
			}


		}

		map = this.addPotHolesAndBreakables(map, listOfLandCoords, potHoleProb, breakableWallProb);


		return map;

	}
	private boolean hasTwoNeighbors(Pair<Integer, Integer> point, List<List<Location>> map) {
		List<Pair<Integer, Integer>> neighbors = this.getNeighbors(point, map);
		Set<Integer> checkedRow = new HashSet<Integer>();
		Set<Integer> checkedCol = new HashSet<Integer>();
		for(Pair<Integer, Integer> neighbor: neighbors) {
			if(checkedRow.contains(neighbor.getFirst())) {
				//there are two land neighbors top and bottom
				return true;
			}else {
				checkedRow.add(neighbor.getFirst());
			}
			if(checkedCol.contains(neighbor.getSecond())) {
				//there are two land neighbors left and right
				return true;
			}else {
				checkedCol.add(neighbor.getSecond());
			}

			
		}
		return false;
		
	}
	
	private List<List<Location>> addPotHolesAndBreakables(List<List<Location>> map, List<Pair<Integer, Integer>> listOfLandCoords,
			double potHoleProb, double breakableWallProb) {

		for(int i = 1; i < numOfRows -1 ; i++) {
			for(int j = 1; j < numOfCols - 1; j++) {
				Pair<Integer, Integer> hopefullyWall = new Pair<Integer, Integer>(i,j);
				if(!listOfLandCoords.contains(hopefullyWall) ){
					//if it is not in the list, it is a wall
					if(this.hasTwoNeighbors(hopefullyWall, map) && this.withProbability(potHoleProb)) {
						map.get(i).set(j, new Pothole());
						//if the wall is surrounded by at least 2 neighbors, switch wall to pothole
					}
					
				}else if (this.hasTwoNeighbors(hopefullyWall, map) && this.withProbability(breakableWallProb)) {
						map.get(i).set(j, new BreakableWall());
					}	
				
			}
		}
		return map;
	}

	public GameMap createMap(double potHoleProb, double breakableWallProb){
		List<List<Location>> map = this.getMapAsList(potHoleProb,breakableWallProb);

		return new GameMap(map);
	}


	private List<List<Location>> addBreakables(List<List<Location>> map, List<Pair<Integer, Integer>> landCoords, double breakableWallProb) {
		for(Pair<Integer, Integer> coord: landCoords) {
			int row = coord.getFirst();
			int col = coord.getSecond();
			Double random = Math.random();
			assertEquals(map.get(row).get(col).getRepresentation(), "l");
			if(random <= breakableWallProb) {

				map.get(row).set(col, new BreakableWall());
			}
		}
		return map;

	}

	public int getNumberOfFreeBlocks(List<List<Location>> map, Pair<Integer,Integer> initial) {
		Set<Pair<Integer,Integer>> checked = new HashSet<Pair<Integer,Integer>>();
		Queue<Pair<Integer,Integer>> q = new LinkedList<Pair<Integer,Integer>>();
		q.add(initial);
		checked.add(initial);

		while(!q.isEmpty()) {
			Pair<Integer,Integer> curr = q.remove();
			List<Pair<Integer,Integer>> neighbors = this.getNeighbors(curr, map);
			for(Pair<Integer,Integer> neighbor: neighbors) {
				if(!checked.contains(neighbor)) {
					checked.add(neighbor);
					q.add(neighbor);
				}
			}

		}

		return checked.size();

	}
	public List<Pair<Integer,Integer>> getNeighbors(Pair<Integer,Integer> curr, List<List<Location>> map){
		List<Pair<Integer,Integer>> output = new ArrayList<Pair<Integer,Integer>>();
		int row = (int) curr.getFirst();
		int col = (int) curr.getSecond();
		List<String> legal = new ArrayList<String>();
		legal.add("l");
		legal.add("b");
		for(int rowdiff = -1; rowdiff <=1; rowdiff+=2) {
			String representation = map.get(row + rowdiff).get(col).toString();
			if(row + rowdiff >=0 && row + rowdiff < map.size() && legal.contains(representation)){
				Pair<Integer,Integer> neighbor = new Pair<Integer,Integer>(row + rowdiff,col);
				output.add(neighbor);
			}
		}
		for(int coldiff = -1; coldiff <=1; coldiff+=2) {
			String representation = map.get(row).get(col + coldiff).toString();

			if(col + coldiff >= 0 && col + coldiff < map.get(0).size() && legal.contains(representation)) {
				Pair<Integer,Integer> neighbor = new Pair<Integer,Integer>(row,col + coldiff);
				output.add(neighbor);
			}
		}
		return output;




	}
	public void printMap(List<List<Location>> map) {
		for(int i = 0 ; i < numOfRows; i ++){
			for(int j=0;j<numOfCols;j++){
				System.out.print(map.get(i).get(j).getRepresentation());
				System.out.print(" ");
			}
			System.out.print("\n");
		}
	}

}