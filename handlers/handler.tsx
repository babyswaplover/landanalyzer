import {
  Context,
  Component
} from "../deps.ts";

/**
 * Request Handler
 */
export abstract class Handler extends Component {
  /** method */
  public static method = "GET";

  /** request path */
  public static path: string;

  /**
   * request handle
   */
  public static handle(context:Context) {}
}
