package edu.brown.cs.bdGaMbPp.Tank;

import edu.brown.cs.bdGaMbPp.Collect.Angle;
import edu.brown.cs.bdGaMbPp.Collect.Coordinate;

public class UserTank implements Tank{
	
	private Coordinate location;
	private Angle angleForward;
	private Angle launcherAngle;
	private boolean isAlive;
	
	private static final double MOVE_SPEED = 1;
	private static final double ROTATE_SPEED = 5;
	private static final double EPSILON = .01;
	
	public UserTank(Coordinate startCoord, double startDegrees) {
		location = startCoord;
		angleForward = new Angle(startDegrees, ROTATE_SPEED);
		launcherAngle = new Angle(startDegrees, ROTATE_SPEED);
		isAlive = true;
	}
	

	@Override
	public void move(Direction d) {
		if (d.equals(Direction.FORWARD)) {
			location.forwardByAngle(angleForward, MOVE_SPEED);
		} else if (d.equals(Direction.BACKWARD)) {
			location.backwardByAngle(angleForward, MOVE_SPEED);
		}
		else if (d.equals(Direction.LEFT)) {
			angleForward.rotateCounterClockwise();
			
		}
		else if (d.equals(Direction.RIGHT)) {
			angleForward.rotateClockwise();
		}
	}

	public void rotateLauncher(Coordinate mouseCoord) {
		double tankCoordX = location.getCoordinate(0);
		double tankCoordY = location.getCoordinate(1);
		double mouseCoordX = mouseCoord.getCoordinate(0);
		double mouseCoordY = mouseCoord.getCoordinate(1);
		
		if (Math.abs(tankCoordX - mouseCoordX) > EPSILON) {
			launcherAngle.setAngle(Math.toDegrees(Math.atan((mouseCoordY-tankCoordY)/(mouseCoordX-tankCoordX))));
		}
		
	}

	@Override
	public void shoot() {
		// TODO Auto-generated method stub
		
	}


	@Override
	public Coordinate getCoord() {
		return location;
	}


	@Override
	public void move() {
		//must be passed direction
		
	}


	@Override
	public Angle getAngleForward() {
		return angleForward;
	}


	@Override
	public Angle getLauncherAngle() {
		return launcherAngle;
	}

	
}
