interface Status {
  /**
   * Power state of the device
   *
   * 0: off
   *
   * 1: on
   */
  Pow: number;
  /**
   * Mode of operation
   *
   * 0: auto
   *
   * 1: cool
   *
   * 2: dry
   *
   * 3: fan
   *
   * 4: heat
   */
  Mod: number;
  /**
   * "SetTem" and "TemUn": set temperature and temperature unit
   *
   * if TemUn = 0, SetTem is the set temperature in Celsius
   *
   * if TemUn = 1, SetTem is the set temperature is Fahrenheit
   */
  SetTem: number;
  /**
   * Fan speed
   *
   * 0: auto
   *
   * 1: low
   *
   * 2: medium-low (not available on 3-speed units)
   *
   * 3: medium
   *
   * 4: medium-high (not available on 3-speed units)
   *
   * 5: high
   */
  WdSpd: number;
  /**
   * Controls the state of the fresh air valve (not available on all units)
   *
   * 0: off
   *
   * 1: on
   */
  Air: number;
  /**
   * "Blow" or "X-Fan", this function keeps the fan running for a while after shutting down. Only usable in Dry and Cool mode
   */
  Blo: number;
  /**
   * Controls Health ("Cold plasma") mode, only for devices equipped with "anion generator", which absorbs dust and kills bacteria
   *
   * 0: off
   *
   * 1: on
   */
  Health: number;
  /**
   * Sleep mode, which gradually changes the temperature in Cool, Heat and Dry mode
   *
   * 0: off
   *
   * 1: on
   */
  SwhSlp: number;
  /**
   * Turns all indicators and the display on the unit on or off
   *
   * 0: off
   *
   * 1: on
   */
  Lig: number;
  /**
   * controls the swing mode of the horizontal air blades (available on limited number of devices, e.g. some Cooper & Hunter units - thanks to mvmn)
   *
   * 0: default
   *
   * 1: full swing
   *
   * 2-6: fixed position from leftmost to rightmost
   *
   * Full swing, like for SwUpDn is not supported
   */
  SwingLfRig: number;
  /**
   * Controls the swing mode of the vertical air blades
   *
   * 0: default
   *
   * 1: swing in full range
   *
   * 2: fixed in the upmost position (1/5)
   *
   * 3: fixed in the middle-up position (2/5)
   *
   * 4: fixed in the middle position (3/5)
   *
   * 5: fixed in the middle-low position (4/5)
   *
   * 6: fixed in the lowest position (5/5)
   *
   * 7: swing in the down most region (5/5)
   *
   * 8: swing in the middle-low region (4/5)
   *
   * 9: swing in the middle region (3/5)
   *
   * 10: swing in the middle-up region (2/5)
   *
   * 11: swing in the upmost region (1/5)
   */
  SwUpDn: number;
  /**
   * Controls the Quiet mode which slows down the fan to its most quiet speed. Not available in Dry and Fan mode.
   *
   * 0: off
   *
   * 1: on
   */
  Quiet: number;
  /**
   * Controls the Quiet mode which slows down the fan to its most quiet speed. Not available in Dry and Fan mode.
   *
   * 0: off
   *
   * 1: on
   */
  Tur: number;
  /**
   * Sets fan speed to the maximum. Fan speed cannot be changed while active and only available in Dry and Cool mode.
   *
   * 0: off
   *
   * 1: on
   */
  StHt: number;
  /**
   * Maintain the room temperature steadily at 8°C and prevent the room from freezing by heating operation when nobody is at home for long in severe winter.
   *
   * @see http://www.gree.ca/en/features
   */
  TemUn: number;
  /**
   * Unknown
   */
  HeatCoolType: number;
  /**
   * This bit is used to distinguish between two Fahrenheit values (see Setting the temperature using Fahrenheit section below)
   */
  TemRec: number;
  /**
   * Energy saving mode
   *
   * 0: off
   *
   * 1: on
   */
  SvSt: number;
}

export default Status;
