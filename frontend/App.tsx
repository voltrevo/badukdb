import BoardTree from "../common/BoardTree.ts";
import { MoveStat } from "../common/IDatabase.ts";
import Protocol from "../common/Protocol.ts";
import MovesTable from "./components/MovesTable.tsx";
import { BoundedGoban, preact, preact as React, tb } from "./deps.ts";
import { default as SignMap, FillSignMap } from "./SignMap.ts";

const width = 9;
const height = 9;
const komi = 5.5;

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
      width: window.innerWidth * 0.7,
      height: window.innerHeight - 0.0001,
    });

    setTimeout(() => {
      this.setBaseState({
        width: window.innerWidth * 0.7,
        height: window.innerHeight,
      });
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
        width: window.innerWidth * 0.7,
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
        gridTemplateColumns: "70% 30%",
      }}
    >
      <div style={{ textAlign: "center" }}>
        {goban}
      </div>
      <div
        style={{
          height: "100vh",
          overflowY: "auto",
          padding: "0.5em",
        }}
      >
        <iframe
          src="https://ghbtns.com/github-btn.html?user=voltrevo&repo=badukdb&type=star&count=true&size=large"
          style={{ border: "0", margin: "1em 0" }}
          scrolling="0"
          width="170"
          height="30"
          title="GitHub"
        >
        </iframe>
        <MovesTable
          moveStats={this.state.moveStats}
          width={this.state.board.board.data.width}
        />
      </div>
    </div>;
  }
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
