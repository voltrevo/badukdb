import BoardTree from "../common/BoardTree.ts";
import { MoveStat } from "../common/IDatabase.ts";
import { DbListing, default as Protocol } from "../common/Protocol.ts";
import MovesTable from "./components/MovesTable.tsx";
import { BoundedGoban, preact, preact as React, tb } from "./deps.ts";
import { default as SignMap, FillSignMap } from "./SignMap.ts";

type Props = {
  api: tb.Implementation<typeof Protocol>;
};

type BoardCalc = {
  moveStats: MoveStat[];
};

type State = {
  databases?: DbListing[];
  selectedDatabase?: DbListing;

  boardId: number;
  board?: BoardTree;
  boardCalc?: BoardCalc;

  display: {
    width: number;
    height: number;
  };
};

function InitialState(): State {
  return {
    boardId: 0,
    display: {
      width: window.innerWidth * 0.7,
      height: window.innerHeight - 0.0001,
    },
  };
}

export default class App extends preact.Component<Props, State> {
  resizeListener: (() => void) | null = null;
  keydownListener: ((evt: KeyboardEvent) => void) | null = null;
  theoState = InitialState();

  constructor(props: Props) {
    super(props);

    this.setState(InitialState());

    setTimeout(() => {
      this.setState({
        display: {
          width: window.innerWidth * 0.7,
          height: window.innerHeight,
        },
      });
    });

    props.api.listDatabases().then((databases) => {
      const selectedDatabase = databases[0];

      this.setState({
        databases,
        selectedDatabase,
      });

      this.setState({
        board: new BoardTree(
          selectedDatabase.start.width,
          selectedDatabase.start.height,
          selectedDatabase.start.komi,
        ),
      });
    });
  }

  componentDidMount() {
    this.keydownListener = (evt) => {
      const board = this.state.board;

      if (board === undefined) {
        return;
      }

      if (evt.key === "ArrowLeft") {
        if (board.parent) {
          this.setState({ board: board.parent });
        }

        return;
      }

      if (evt.key === "ArrowRight") {
        const moveStat = this.state.boardCalc?.moveStats?.[0];

        if (moveStat) {
          this.setState({
            board: board.playLocation(
              moveStat.location,
              board.board.data.colorToPlay,
            ),
          });

          return;
        }

        const { children: [child] } = board;

        if (child) {
          this.setState({ board: child });
        }

        return;
      }
    };

    window.addEventListener("keydown", this.keydownListener);

    this.resizeListener = () => {
      this.setState({
        display: {
          width: window.innerWidth * 0.7,
          height: window.innerHeight,
        },
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

  setState(stateUpdates: Partial<State>) {
    const previousState = this.theoState;
    const newState = { ...previousState, ...stateUpdates };

    if (
      newState.selectedDatabase !== previousState.selectedDatabase ||
      newState.board !== previousState.board
    ) {
      const boardId = previousState.boardId + 1;
      stateUpdates.boardId = boardId;
      stateUpdates.boardCalc = undefined;

      if (newState.board && newState.selectedDatabase) {
        this.props.api.findMoveStats(
          newState.selectedDatabase.name,
          newState.board.board.Board().hash.value.value,
        ).then(({ processingTime, moveStats }) => {
          console.log({ processingTime });

          this.setState({
            boardCalc: { moveStats },
          });
        });
      }
    }

    this.theoState = newState;
    super.setState(stateUpdates);
  }

  render(): preact.ComponentChild {
    const { selectedDatabase, board, boardCalc } = this.state;

    if (
      selectedDatabase === undefined ||
      board === undefined ||
      boardCalc === undefined
    ) {
      return <>Loading</>;
    }

    const { width, height } = selectedDatabase.start;

    const markerMap = FillSignMap<Marker>(width, height, null);
    const ghostStoneMap = FillSignMap<GhostStone>(width, height, null);

    for (const moveStat of this.state.boardCalc?.moveStats ?? []) {
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

    for (const { lastMove } of board.children ?? []) {
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

    if (board.lastMove?.location) {
      const { x, y } = board.lastMove.location;
      markerMap[y - 1][x - 1] = { type: "point" };
    }

    const goban = preact.h(BoundedGoban, {
      maxWidth: this.state.display.width ?? 500,
      maxHeight: this.state.display.height ?? 500,
      signMap: SignMap(board.board),
      ghostStoneMap,
      markerMap,
      busy: !this.state.boardCalc?.moveStats,
      showCoordinates: true,
      onVertexClick: (_evt: unknown, [x, y]: [number, number]) => {
        x++;
        y++;

        this.setState({
          board: board.play(
            x,
            y,
            board.board.data.colorToPlay,
          ),
        });
      },
    });

    return <div
      class={`${board.board.data.colorToPlay}-to-play`}
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
          moveStats={this.state.boardCalc?.moveStats ?? []}
          width={width}
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
