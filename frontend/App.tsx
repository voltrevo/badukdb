import { Color } from "../common/BoardClass.ts";
import BoardTree from "../common/BoardTree.ts";
import PrettyLocation from "../common/PrettyLocation.ts";
import Protocol, { MoveStat } from "../common/Protocol.ts";
import { BoundedGoban, preact, preact as React, tb } from "./deps.ts";
import { default as SignMap, FillSignMap } from "./SignMap.ts";

const width = 19;
const height = 19;
const komi = 6.5;

type Props = {
  api: tb.Implementation<typeof Protocol>;
};

type BaseState = {
  board: BoardTree;
  width?: number;
  height?: number;
};

type State = BaseState & {
  id: number;
  moveStats: null | MoveStat[];
};

export default class App extends preact.Component<Props, State> {
  resizeListener: (() => void) | null = null;
  keydownListener: ((evt: KeyboardEvent) => void) | null = null;

  constructor(props: Props) {
    super(props);

    this.setBaseState({
      width: window.innerWidth / 2,
      height: window.innerHeight,
    });
  }

  componentDidMount() {
    this.keydownListener = (evt) => {
      if (evt.key === "ArrowLeft") {
        this.setBaseState({
          board: this.state.board.parent ?? this.state.board,
        });

        return;
      }

      if (evt.key === "ArrowRight") {
        const moveStat = this.state.moveStats?.[0];

        if (moveStat) {
          this.setBaseState({
            board: this.state.board.playLocation(
              moveStat.location,
              this.state.board.board.data.colorToPlay,
            ),
          });

          return;
        }

        const { children: [child] } = this.state.board;

        if (child) {
          this.setBaseState({
            board: child,
          });
        }

        return;
      }
    };

    window.addEventListener("keydown", this.keydownListener);

    this.resizeListener = () => {
      this.setBaseState({
        width: window.innerWidth / 2,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", this.resizeListener);
  }

  componentWillUnmount() {
    if (this.keydownListener) {
      window.removeEventListener("keydown", this.keydownListener);
    }

    if (this.resizeListener) {
      window.removeEventListener("resize", this.resizeListener);
    }
  }

  setBaseState(baseState: Partial<BaseState>) {
    const priorState: State = this.state ?? {
      id: 0,
      board: new BoardTree(width, height, komi),
      moveStats: null,
    };

    const id = priorState.id + 1;

    const state: State = {
      ...priorState,
      ...baseState,
      id,
    };

    if ("board" in baseState || state.moveStats === null) {
      state.moveStats = null;

      this.props.api.findMoveStats(state.board.board.Board().hash.value.value)
        .then(({ moveStats, processingTime }) => {
          console.log({ processingTime });

          if (this.state.id === id) {
            this.setState({ moveStats });
          }
        });
    }

    this.setState(state);
  }

  render(): preact.ComponentChild {
    const markerMap = FillSignMap<Marker>(width, height, null);
    const ghostStoneMap = FillSignMap<GhostStone>(width, height, null);

    for (const moveStat of this.state.moveStats ?? []) {
      if (moveStat.location === null) {
        continue;
      }

      const [x, y] = [moveStat.location.x - 1, moveStat.location.y - 1];

      const sidedResult = moveStat.color === "black"
        ? moveStat.result
        : moveStat.count - moveStat.result;

      const winRate = `${Math.round(100 * sidedResult / moveStat.count)}%`;

      markerMap[y][x] = {
        type: "label",
        label: moveStat.count > 9
          ? winRate
          : `${sidedResult}/${moveStat.count}`,
      };
    }

    for (const { lastMove } of this.state.board.children) {
      const location = lastMove?.location;

      if (location) {
        const x = location.x - 1;
        const y = location.y - 1;

        markerMap[y][x] ??= {
          type: "label",
          label: "",
        };
      }
    }

    if (this.state.board.lastMove?.location) {
      const { x, y } = this.state.board.lastMove.location;
      markerMap[y - 1][x - 1] = { type: "point" };
    }

    const goban = preact.h(BoundedGoban, {
      maxWidth: this.state.width ?? 500,
      maxHeight: this.state.height ?? 500,
      signMap: SignMap(this.state.board.board),
      ghostStoneMap,
      markerMap,
      busy: this.state.moveStats === null,
      showCoordinates: true,
      onVertexClick: (_evt: unknown, [x, y]: [number, number]) => {
        x++;
        y++;

        this.setBaseState({
          board: this.state.board.play(
            x,
            y,
            this.state.board.board.data.colorToPlay,
          ),
        });
      },
    });

    return <div
      class={`${this.state.board.board.data.colorToPlay}-to-play`}
      style={{
        width: "100vw",
        height: "100vh",
        display: "grid",
        gridTemplateColumns: "50% 50%",
      }}
    >
      <div style={{ textAlign: "center" }}>
        {goban}
      </div>
      <div
        style={{
          display: "inline-grid",
          height: "100vh",
          overflowY: "auto",
        }}
      >
        <table class="moves-table">
          {(this.state.moveStats ?? [])
            .sort((a, b) => b.count - a.count)
            .map(
              (moveStat) => {
                return <tr>
                  <td>
                    <b>{PrettyLocation(width, moveStat.location)}</b>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {
                      // FIXME: duplication
                      moveStat.color === "black"
                        ? moveStat.result
                        : moveStat.count - moveStat.result
                    }/{moveStat.count}
                  </td>
                  <td>{renderDetail(moveStat.color, moveStat.detail)}</td>
                </tr>;
              },
            )}
        </table>
      </div>
    </div>;
  }
}

function renderDetail(
  color: Color,
  detail: MoveStat["detail"],
): preact.JSX.Element {
  if (detail === null) {
    return <></>;
  }

  const counts = new Map<string, number>();

  return <>
    {detail.map(({ result, externalId }, i): preact.JSX.Element => {
      const sidedResult = color === "black" ? result : 1 - result;

      const renderColor = sidedResult === 0
        ? "red"
        : sidedResult === 1
        ? "green"
        : "black";

      return <>
        {i === 0 ? "" : ", "}
        <span style={{ color: renderColor }}>{externalId}</span>
      </>;
    })}
  </>;
}

type GhostStone = (
  | null
  | {
    sign: -1 | 0 | 1;
    type?: "good" | "interesting" | "doubtful" | "bad";
    faint?: boolean;
  }
);

type Marker = (
  | null
  | { type: "label"; label: string }
  | {
    type: (
      | "circle"
      | "cross"
      | "triangle"
      | "square"
      | "point"
      | "loader"
    );
  }
);
