declare namespace svelte.JSX {
  interface HTMLAttributes<T> {
    onpan?: (event: CustomEvent<any>) => void;
    onpanup?: (event: CustomEvent<any>) => void;
    onpandown?: (event: CustomEvent<any>) => void;
    onpanmove?: (event: CustomEvent<any>) => void;
    onpinch?: (event: CustomEvent<any>) => void;
    onpinchup?: (event: CustomEvent<any>) => void;
    onpinchdown?: (event: CustomEvent<any>) => void;
    onpinchmove?: (event: CustomEvent<any>) => void;
    onrotate?: (event: CustomEvent<any>) => void;
    onrotateup?: (event: CustomEvent<any>) => void;
    onrotatedown?: (event: CustomEvent<any>) => void;
    onrotatemove?: (event: CustomEvent<any>) => void;
    onswipe?: (event: CustomEvent<any>) => void;
    onswipeup?: (event: CustomEvent<any>) => void;
    onswipedown?: (event: CustomEvent<any>) => void;
    onswipemove?: (event: CustomEvent<any>) => void;
    ontap?: (event: CustomEvent<any>) => void;
    ontapup?: (event: CustomEvent<any>) => void;
    ontapdown?: (event: CustomEvent<any>) => void;
    ontapmove?: (event: CustomEvent<any>) => void;
    onpress?: (event: CustomEvent<any>) => void;
    onpressup?: (event: CustomEvent<any>) => void;
    onpressdown?: (event: CustomEvent<any>) => void;
    onpressmove?: (event: CustomEvent<any>) => void;
  }
}
